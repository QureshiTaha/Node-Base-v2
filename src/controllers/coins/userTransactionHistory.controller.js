const { sqlQuery } = require('../../Modules/sqlHandler');

module.exports = () => {
  return async (req, res) => {
    const userID = req.params.userID;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
      const unifiedTransactions = await sqlQuery(`
        SELECT * FROM (
          SELECT 
            ct.coinTransactionId,
            ct.senderId,
            IFNULL(sender.userFirstName, 'Store') AS senderFirstName,
            IFNULL(sender.userSurname, '') AS senderSurname,
            ct.receiverId,
            IFNULL(receiver.userFirstName, 'Unknown') AS receiverFirstName,
            IFNULL(receiver.userSurname, '') AS receiverSurname,
            MAX(ct.transactionDate) AS transactionDate,
            SUM(ct.coinCount) AS coinCount,
            ct.status AS status
          FROM db_coin_transaction ct
          LEFT JOIN db_users sender ON ct.senderId = sender.userID
          LEFT JOIN db_users receiver ON ct.receiverId = receiver.userID
          WHERE ct.senderId = ? OR ct.receiverId = ?
          GROUP BY ct.coinTransactionId, ct.senderId, ct.receiverId

          UNION ALL

          SELECT 
            p.paymentId AS coinTransactionId,
            'STORE' AS senderId,
            'Store' AS senderFirstName,
            '' AS senderSurname,
            p.userId AS receiverId,
            IFNULL(u.userFirstName, 'Unknown') AS receiverFirstName,
            IFNULL(u.userSurname, '') AS receiverSurname,
            p.createdAt AS transactionDate,
            p.coinCount,
            p.status
          FROM db_coin_payments p
          LEFT JOIN db_users u ON p.userId = u.userID
          WHERE p.userId = ?
            AND NOT EXISTS (
              SELECT 1 
              FROM db_coin_transaction ct 
              WHERE ct.receiverId = p.userId 
                AND ct.coinCount = p.coinCount 
                AND DATE(ct.transactionDate) = DATE(p.createdAt)
            )
        ) AS combined
        ORDER BY transactionDate DESC
        LIMIT ? OFFSET ?
      `, [userID, userID, userID, limit, offset]);


      const totalCountResult = await sqlQuery(`
        SELECT COUNT(*) AS totalCount
        FROM (
          SELECT ct.coinTransactionId
          FROM db_coin_transaction ct
          WHERE ct.senderId = ? OR ct.receiverId = ?
          UNION
          SELECT p.paymentId
          FROM db_coin_payments p
          WHERE p.userId = ?
            AND NOT EXISTS (
              SELECT 1 
              FROM db_coin_transaction ct 
              WHERE ct.receiverId = p.userId 
                AND ct.coinCount = p.coinCount 
                AND DATE(ct.transactionDate) = DATE(p.createdAt)
            )
        ) AS totalCombined
      `, [userID, userID, userID]);

      const totalCount = totalCountResult[0]?.totalCount || 0;
      const haveMore = (offset + limit) < totalCount;

      return res.status(200).json({
        status: true,
        totalTransactions: totalCount,
        data: unifiedTransactions.map((row, index) => {
          let transactionType = "";
          let transactionLabel = "";

          if (row.senderId === userID) {
            transactionType = "sent";
            transactionLabel = `Sent to ${row.receiverFirstName}`;
          } else if (
            row.receiverId === userID &&
            (row.senderId === "STORE" ||
              row.senderFirstName === "Store" ||
              row.senderId === "Purchased from Store")
          ) {
            if (row.status === "completed") {
              transactionType = "received";
              transactionLabel = "Purchased from Store";
            } else {
              transactionType = "pending";
              transactionLabel = "Pending Purchase";
            }
          } else if (row.receiverId === userID) {
            transactionType = "received";
            transactionLabel = `Received from ${row.senderFirstName}`;
          }

          return {
            ...row,
            transactionType,
            transactionLabel,
            ...(index === unifiedTransactions.length - 1
              ? { haveMore, totalCount }
              : {}),
          };
        })
      });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ status: false, msg: "Internal Server Error" });
    }
  };
};
