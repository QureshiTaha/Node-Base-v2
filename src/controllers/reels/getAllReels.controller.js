const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const { sqlQuery } = require('../../Modules/sqlHandler');

module.exports =(dependencies) => {
return async (req, res,next) => {
 
    try{
     const allReels = await sqlQuery(`SELECT * FROM db_reels ORDER BY timeStamp DESC `);
     res.status(200).json({
        status: true,
        msg: 'Successfully fetched Reels',
        data: allReels
      });
    }
    catch(error){
        res.status(400).json({ success: false, message: `Error finding all the reels: ${error}` });
    }
}
};