const moment = require('moment');
const { sqlQuery } = require('../../Modules/sqlHandler');
const logsUseCase = require('../Logs/logs.UseCase');
module.exports = (dependencies) => {
  return async (req, res, next) => {
    try {
      const { taskID, userID } = req.params;

      if (!taskID) {
        res.status(400).json({ success: false, message: 'taskID is required in Params' });
      } else {
        // await sqlQuery(`DELETE FROM db_tasks WHERE taskID = '${taskID}'`);
        await sqlQuery(`UPDATE db_tasks SET isDeleted = 1, deleted_at = ? WHERE taskID = ?`, [moment().format('YYYY-MM-DD HH:mm:ss'), taskID]);

        // Add to logs
        await logsUseCase.addLogs({
          taskID,
          userID: userID,
          message: `Task deleted by ${req.user.userFirstName} ${req.user.userSurname}`,
          log_type: 'system'
        })

        res.status(200).json({ success: true, message: 'Task deleted successfully!' });
      }
    } catch (error) {
      res.status(400).json({ success: false, message: `Error Editing task StackTrace: ${error}` });
    }
  };
};
