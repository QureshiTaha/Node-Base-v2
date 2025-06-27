const { sqlQuery } = require('../../Modules/sqlHandler');
const { v4: uuidv4 } = require('uuid');

module.exports = () => {
  return async (req, res) => {
    const { userID, count } = req.body;

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

      // Get available coins from db_coin_store table
      const coinsResult = await sqlQuery(
        `SELECT coinStoreId FROM db_coin_store WHERE ownerId IS NULL LIMIT ? FOR UPDATE`,
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
      const coinStoreIds = coinsResult.map(c => c.coinStoreId);
      const placeholders = coinStoreIds.map(() => '?').join(',');

      // Start full transaction
      await sqlQuery('START TRANSACTION');

      // Update coin ownership
      await sqlQuery(
        `UPDATE db_coin_store 
         SET ownerId = ?, purchaseId = ?, purchasedAt = NOW() 
         WHERE coinStoreId IN (${placeholders})`,
        [userID, purchaseId, ...coinStoreIds]
      );

      // Prepare bulk insert into db_coin_transaction
      const insertValues = [];
      const insertParams = [];
      const senderId = "Purchased from Store"; // Use a fixed sender ID for store purchases
      const coinTransactionId = uuidv4();

      for (const coin of coinsResult) {
        insertValues.push('(?, ?, ?, ?, NOW())');
        insertParams.push(coinTransactionId, coin.coinStoreId, senderId, userID);
      }

      const insertQuery = `
        INSERT INTO db_coin_transaction 
        (coinTransactionId, coinId, senderId, receiverId, transactionDate)
        VALUES ${insertValues.join(', ')}
      `;

      await sqlQuery(insertQuery, insertParams);

      // Commit full transaction
      await sqlQuery('COMMIT');

      return res.status(200).json({
        status: true,
        msg: `${coinsResult.length} coin(s) purchased successfully`,
        purchaseId,
        coinIds: coinStoreIds
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
