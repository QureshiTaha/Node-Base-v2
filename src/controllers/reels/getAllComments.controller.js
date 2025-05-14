const sql = require('../../Modules/sqlHandler');
const sqlQuery = sql.query;

module.exports = () => {
  return async (req, res) => {
    try {
      const comments = await sqlQuery(`
        SELECT commentId, reelId, userID, commentText, commentedAt
        FROM db_reel_comments
        ORDER BY commentedAt DESC
      `);

      res.status(200).json({
        status: true,
        msg: 'Comments fetched successfully',
        data: comments
      });
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({
        status: false,
        msg: 'Internal Server Error',
        error: error.toString()
      });
    }
  };
};
    