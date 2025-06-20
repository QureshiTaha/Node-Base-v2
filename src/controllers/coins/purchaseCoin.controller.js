const { sqlQuery } = require('../../Modules/sqlHandler');
const { v4: uuidv4 } = require('uuid');

module.exports = () => {
  return async (req, res) => {
    const { userID, count } = req.body;

    // Validation
    if (!userID || !count) {
      return res.status(400).json({ status: false, msg: 'userID and count are required' });
    }
    if (isNaN(count) || count <= 0) {
      return res.status(400).json({ status: false, msg: 'Count must be a positive number' });
    }

    try {
      const [userResult] = await sqlQuery(
        `SELECT * FROM db_users WHERE userID = ? AND userDeleted IS NULL LIMIT 1`, 
        [userID]
      );

      if (!userResult) {
        return res.status(404).json({ status: false, msg: 'User not found or deleted' });
      }

      const coinsResult = await sqlQuery(
        `SELECT coinStoreId FROM coin_store WHERE ownerId IS NULL LIMIT ? FOR UPDATE`, 
        [parseInt(count)]
      );

      if (coinsResult.length === 0) {
        return res.status(400).json({
          status: false,
          msg: 'No coins available in stock. Please contact admin or wait for restock.'
        });
      }

      if (coinsResult.length < count) {
        return res.status(400).json({
          status: false,
          msg: `Only ${coinsResult.length} coins available for purchase right now`
        });
      }

      const purchaseId = uuidv4();
      const batchSize = 100;  
      const concurrencyLimit = 5;

      const batches = [];
      for (let i = 0; i < coinsResult.length; i += batchSize) {
        batches.push(coinsResult.slice(i, i + batchSize));
      }

      // Wrap entire transaction
      await sqlQuery('START TRANSACTION');

      const runningBatches = new Set();

      for (const batch of batches) {
        if (runningBatches.size >= concurrencyLimit) {
          await Promise.race(runningBatches);
        }

        const batchPromise = (async () => {
          const placeholders = batch.map(() => '?').join(',');
          const coinIds = batch.map(c => c.coinStoreId);
          await sqlQuery(
            `UPDATE coin_store 
             SET ownerId = ?, purchaseId = ?, purchasedAt = NOW() 
             WHERE coinStoreId IN (${placeholders})`,
            [userID, purchaseId, ...coinIds]
          );
        })();

        runningBatches.add(batchPromise);
        batchPromise.finally(() => runningBatches.delete(batchPromise));
      }

      await Promise.all(runningBatches);
      await sqlQuery('COMMIT');

      return res.status(200).json({
        status: true,
        msg: `${coinsResult.length} coin(s) purchased successfully`,
        purchaseId,
        coinIds: coinsResult.map(c => c.coinStoreId)
      });

    } catch (error) {
      await sqlQuery('ROLLBACK');
      console.error('Purchase error:', error);
      return res.status(500).json({ 
        status: false, 
        msg: 'Internal server error', 
        error: error.message 
      });
    }
  };
};
