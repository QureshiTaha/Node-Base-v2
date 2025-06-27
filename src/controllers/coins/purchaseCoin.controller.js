const { sqlQuery } = require('../../Modules/sqlHandler');
const { v4: uuidv4 } = require('uuid');

module.exports = () => {
  return async (req, res) => {
    const { userID, offerId } = req.body;

    if (!userID || !offerId) {
      return res.status(400).json({ status: false, msg: 'userID and offerId are required' });
    }

    try {
      const user = await sqlQuery(`SELECT * FROM db_users WHERE userID = ? AND userDeleted IS NULL LIMIT 1`, [userID]);
      if (user.length === 0) {
        return res.status(404).json({ status: false, msg: 'User not found or deleted' });
      }

      const [offer] = await sqlQuery(`SELECT * FROM db_coin_offers WHERE offerId = ? AND isActive = 1 LIMIT 1`, [offerId]);
      if (!offer) {
        return res.status(404).json({ status: false, msg: 'Offer not found or inactive' });
      }

      const coinAmount = offer.coinAmount;
      const offerPrice = offer.offerPrice;

      const coinsResult = await sqlQuery(
        `SELECT coinStoreId FROM db_coin_store WHERE ownerId IS NULL LIMIT ? FOR UPDATE`,
        [coinAmount]
      );

      if (coinsResult.length < coinAmount) {
        return res.status(400).json({
          status: false,
          msg: `Only ${coinsResult.length} unowned coins available`
        });
      }

      const purchaseId = uuidv4();
      const paymentId = uuidv4();
      const transactionId = uuidv4();

      await sqlQuery('START TRANSACTION');

      try {
        const coinIds = coinsResult.map(c => c.coinStoreId);
        const placeholders = coinIds.map(() => '?').join(',');

        await sqlQuery(
          `UPDATE db_coin_store 
           SET ownerId = ?, purchaseId = ?, purchasedAt = NOW() 
           WHERE coinStoreId IN (${placeholders})`,
          [userID, purchaseId, ...coinIds]
        );

        await sqlQuery(
          `INSERT INTO db_payments (
            paymentId, userId, amount, coinCount, paymentMethod, status, transactionId, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            paymentId,
            userID,
            offerPrice, // Correct amount from offer
            coinAmount,
            'internal',
            'completed',
            transactionId
          ]
        );

        await sqlQuery('COMMIT');
      } catch (err) {
        await sqlQuery('ROLLBACK');
        throw err;
      }

      return res.status(200).json({
        status: true,
        msg: `${coinAmount} coins purchased successfully`,
        purchaseId,
        coinIds: coinsResult.map(c => c.coinStoreId),
        paymentId
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
