const sql = require('../../Modules/sqlHandler');
const sqlQuery = sql.query;
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

module.exports = () => {
  return async (req, res) => {
    const { ownerId, purchaseId } = req.body;

    // Validate required fields
    if (!ownerId || !purchaseId) {
      return res.status(400).json({
        status: false,
        msg: 'ownerId and purchaseId are required',
      });
    }

    try {
      const coinStoreId = uuidv4();
      const purchasedAt = moment().format('YYYY-MM-DD HH:mm:ss');

      await sqlQuery(`
        INSERT INTO coin_store (coinStoreId, ownerId, purchaseId, purchasedAt)
        VALUES ('${coinStoreId}', '${ownerId}', '${purchaseId}', '${purchasedAt}')
      `);

      res.status(201).json({
        status: true,
        msg: 'Coin added successfully',
        data: {
          coinStoreId,
          ownerId,
          purchaseId,
          purchasedAt,
        },
      });
    } catch (error) {
      console.error("Error adding coin:", error);
      res.status(500).json({
        status: false,
        msg: 'Internal Server Error',
        error: error.toString(),
      });
    }
  };
};
