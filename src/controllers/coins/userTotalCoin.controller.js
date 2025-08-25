const { sqlQuery } = require('../../Modules/sqlHandler');

module.exports = () => {
  return async (req, res) => {
    const { userID } = req.params;
    const { page, limit } = req.query;

    if (!userID) {
      return res.status(400).json({
        status: false,
        msg: 'userID is required'
      });
    }

    const _page = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
    const _limit = parseInt(limit, 10) > 0 ? parseInt(limit, 10) : 10;
    const offset = (_page - 1) * _limit;

    try {
      const [userInfo] = await sqlQuery(
        `SELECT 
           u.userID, 
           u.userFirstName, 
           u.userSurname, 
           u.userPhone,
           COUNT(cs.id) AS totalCoins
         FROM db_users u
         LEFT JOIN db_coin_store cs ON u.userID = cs.ownerId
         WHERE u.userID = ?
         GROUP BY u.userID, u.userFirstName, u.userSurname, u.userPhone`,
        [userID]
      );

      if (!userInfo) {
        return res.status(404).json({
          status: false,
          msg: 'User not found'
        });
      }

      const coins = await sqlQuery(
        `SELECT 
           id, coinStoreId, transactionId, purchasedAt
         FROM db_coin_store
         WHERE ownerId = ?
         ORDER BY purchasedAt DESC
         LIMIT ? OFFSET ?`,
        [userID, _limit, offset]
      );

      const totalCount = userInfo.totalCoins;
      const totalPages = Math.ceil(totalCount / _limit);
      const haveMore = _page < totalPages;

      return res.status(200).json({
        status: true,
        msg: 'User coin details fetched successfully',
        user: {
          userID: userInfo.userID,
          firstName: userInfo.userFirstName,
          surname: userInfo.userSurname,
          phone: userInfo.userPhone,
        },
        totalCoins: userInfo.totalCoins,
        coins,
        pagination: {
          page: _page,
          limit: _limit,
          totalCount,
          totalPages,
          haveMore
        }
      });

    } catch (error) {
      console.error('Error fetching user coin details:', error);
      return res.status(500).json({
        status: false,
        msg: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      });
    }
  };
};
