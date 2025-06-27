const { sqlQuery } = require('../../Modules/sqlHandler');

module.exports = () => {
  return async (req, res) => {
    const userID = req.params.userID;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
      const transactions = await sqlQuery(`
        SELECT 
          ct.coinTransactionId,
          ct.senderId,
          IFNULL(sender.userFirstName, 'Store') AS senderFirstName,
          IFNULL(sender.userSurname, '') AS senderSurname,
          ct.receiverId,
          IFNULL(receiver.userFirstName, 'Unknown') AS receiverFirstName,
          IFNULL(receiver.userSurname, '') AS receiverSurname,
          MAX(ct.transactionDate) AS transactionDate,
          COUNT(*) AS coinCount
        FROM db_coin_transaction ct
        LEFT JOIN db_users sender ON ct.senderId = sender.userID
        LEFT JOIN db_users receiver ON ct.receiverId = receiver.userID
        WHERE ct.senderId = ? OR ct.receiverId = ?
        GROUP BY ct.coinTransactionId, ct.senderId, ct.receiverId
        ORDER BY transactionDate DESC
        LIMIT ? OFFSET ?
      `, [userID, userID, limit, offset]);

      const totalCountResult = await sqlQuery(`
        SELECT COUNT(DISTINCT coinTransactionId) AS totalCount 
        FROM db_coin_transaction 
        WHERE senderId = ? OR receiverId = ?
      `, [userID, userID]);

      const totalCount = totalCountResult[0]?.totalCount || 0;
      const haveMore = (offset + limit) < totalCount;

      return res.status(200).json({
        status: true,
        data: transactions.map(row => ({
          ...row,
          haveMore,
          totalCount
        }))
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ status: false, msg: "Internal Server Error" });
    }
  }
}
