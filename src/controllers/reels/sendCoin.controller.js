const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const sql = require('../../Modules/sqlHandler');
const sqlQuery = sql.query;

module.exports = () => {
  return async (req, res) => {
    const { coinId, senderId, receiverId } = req.body;

    // Input validation
    if (!coinId || !senderId || !receiverId) {
      return res.status(400).json({
        status: false,
        msg: 'coinId, senderId, and receiverId are required'
      });
    }

    try {
      const coinTransactionId = uuidv4();
      const transactionDate = moment().format('YYYY-MM-DD HH:mm:ss');

      await sqlQuery(`
        INSERT INTO coin_transaction (coinTransactionId, coinId, senderId, receiverId, transactionDate)
        VALUES ('${coinTransactionId}', '${coinId}', '${senderId}', '${receiverId}', '${transactionDate}')
      `);

      return res.status(201).json({
        status: true,
        msg: 'Coin sent successfully',
        data: { coinTransactionId, coinId, senderId, receiverId, transactionDate }
      });

    } catch (error) {
      console.error("Error sending coin:", error);
      return res.status(500).json({ status: false, msg: 'Internal Server Error', error: error.toString()
      });
    }
  };
};
