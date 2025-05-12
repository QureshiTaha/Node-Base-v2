const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const { sqlQuery } = require('../../Modules/sqlHandler');


module.exports = (dependencies) => {
  return async (req, res, next) => {
    const { userID } = req.params;
    if (!userID) {
      res.status(400).json({ status: false, msg: 'userID is Required' });
      return
    }
    try {
      const reels = await sqlQuery(`SELECT * FROM db_reels WHERE userID = '${userID}' ORDER BY timeStamp DESC`);
      console.log("userID=>", userID);
      res.status(200).json({
        status: true,
        msg: 'Successfully fetched Reels',
        data: reels
      });
    }
    catch (error) {
      res.status(400).json({ success: false, message: `Error finding reels: ${error}` });
    }
  };
};
