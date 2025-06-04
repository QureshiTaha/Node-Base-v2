const { sqlQuery } = require('../../Modules/sqlHandler');

module.exports = () => {
  return async (req, res) => {
    const { userID, page, limit } = req.params;

    if (!userID) {
      return res.status(400).json({
        status: false,
        msg: 'userID is required'
      });
    }

    const _page = parseInt(page) || 1;
    const _limit = parseInt(limit) || 30;
    const offset = (_page - 1) * _limit;

    try {
      const [countResult] = await sqlQuery(`
        SELECT COUNT(*) AS count FROM followers WHERE followTo = ?
      `, [userID]);

      const totalCount = countResult?.count || 0;

      if (totalCount === 0) {
        return res.status(404).json({
          status: false,
          msg: 'No followers found',
          totalFollowers: 0
        });
      }

      const followersList = await sqlQuery(`
        SELECT 
          u.userID, u.userFirstName, u.userSurname, u.userPhone, u.userEmail, u.profilePic
        FROM followers f
        JOIN db_users u ON f.followBy = u.userID
        WHERE f.followTo = ?
        ORDER BY f.followAt DESC
        LIMIT ? OFFSET ?
      `, [userID, _limit, offset]);

      if (followersList.length > 0) {
        followersList[followersList.length - 1].haveMore = totalCount > _page * _limit;
        followersList[followersList.length - 1].totalCount = totalCount;
      }

      return res.status(200).json({
        status: true,
        msg: 'Followers list fetched successfully',
        data: followersList,
      });

    } catch (error) {
      console.error('Error fetching followers list:', error);
      return res.status(500).json({
        status: false,
        msg: 'Internal Server Error',
        error: error.toString()
      });
    }
  };
};
