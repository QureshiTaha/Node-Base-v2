const moment = require('moment');
const { sqlQuery } = require('../../Modules/sqlHandler');
const logsUseCase = require('../Logs/logs.UseCase');
const userUseCase = require('../users/userUseCase');
module.exports = (dependencies) => {
  return async (req, res, next) => {
    try {
      const { taskID, userID } = req.params;

      if (!taskID || !userID) {
        res.status(400).json({ success: false, message: 'taskID and userID is required in Params for deleting task' });
      } else {
        const User = await userUseCase.getUserByUserID(userID);
        if (User.length) {
          // await sqlQuery(`DELETE FROM db_tasks WHERE taskID = '${taskID}'`);
          await sqlQuery(`UPDATE db_tasks SET isDeleted = ?, deleted_at = ? WHERE taskID = ?`, ["1", moment().format('YYYY-MM-DD HH:mm:ss'), taskID]);

          // Add to logs
          await logsUseCase.addLogs({
            taskID,
            userID: userID,
            message: `Task deleted by ${User[0].userFirstName} ${User[0].userSurname}`,
            log_type: 'system'
          })
          

          res.status(200).json({ success: true, message: 'Task deleted successfully!' });
          return;
        } else {
          res.status(400).json({ success: false, message: 'Invalid userID' });
          // return;
        }
      }
    } catch (error) {
      console.log(`Error Deleting task StackTrace: ${error}`);

      res.status(400).json({ success: false, message: `Error Deleting task StackTrace: ${error}` });
    }
  };
};
