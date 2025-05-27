const { sqlQuery } = require('../../Modules/sqlHandler');
const { v4: uuidv4 } = require('uuid');

module.exports = () => {
  return async (req, res) => {
    const { userID, count } = req.body;

    // Input validation
    if (!userID || !count) {
      return res.status(400).json({
        status: false,
        msg: 'userId and count are required'
      });
    } else if (isNaN(count)) {
      return res.status(400).json({
        status: false,
        msg: 'Count must be a number'
      });
    } else if (count <= 0) {
      return res.status(400).json({
        status: false,
        msg: 'Count must be greater than 0'
      });
    }

    try {
      const userResult = await sqlQuery(
        `SELECT * FROM db_users WHERE userID = ? AND userDeleted IS NULL LIMIT 1`,
        [userID]
      );

      if (userResult.length === 0) {
        return res.status(404).json({
          status: false,
          msg: 'User not found or deleted'
        });
      }

      const coinsResult = await sqlQuery(
        `SELECT coinStoreId FROM coin_store 
         WHERE ownerId IS NULL 
         LIMIT ? FOR UPDATE`,
        [parseInt(count)]
      );

      if (coinsResult.length < count) {
        return res.status(400).json({
          status: false,
          msg: `Only ${coinsResult.length} unowned coins available`
        });
      }

      const purchaseId = uuidv4();
      const batchSize = 100; 
      const concurrencyLimit = 5;

      const updateInBatches = async (coins) => {
        const batches = [];
        
        for (let i = 0; i < coins.length; i += batchSize) {
          batches.push(coins.slice(i, i + batchSize));
        }

        const processBatch = async (batch) => {
          const placeholders = batch.map(() => '?').join(',');
          const coinIds = batch.map(coin => coin.coinStoreId);
          
          return sqlQuery(
            `UPDATE coin_store 
             SET ownerId = ?, 
                 purchaseId = ?, 
                 purchasedAt = NOW() 
             WHERE coinStoreId IN (${placeholders})`,
            [userID, purchaseId, ...coinIds]
          );
        };

        const results = [];
        const runningBatches = new Set();

        for (const batch of batches) {
          if (runningBatches.size >= concurrencyLimit) {
            await Promise.race(runningBatches);
          }

          const batchPromise = processBatch(batch)
            .finally(() => runningBatches.delete(batchPromise));
          
          runningBatches.add(batchPromise);
          results.push(batchPromise);
        }

        await Promise.all(results);
      };

      await sqlQuery('START TRANSACTION');
      
      try {
        await updateInBatches(coinsResult);
        await sqlQuery('COMMIT');
      } catch (error) {
        await sqlQuery('ROLLBACK');
        throw error;
      }

      return res.status(200).json({
        status: true,
        msg: `${coinsResult.length} coin(s) purchased successfully`,
        purchaseId,
        coinIds: coinsResult.map(c => c.coinStoreId)
      });

    } catch (error) {
      console.error('Error purchasing coins:', error);
      return res.status(500).json({
        status: false,
        msg: 'Internal Server Error',
        error: error.message
      });
    }
  };
};