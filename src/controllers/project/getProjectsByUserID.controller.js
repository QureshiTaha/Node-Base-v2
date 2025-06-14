const moment = require('moment');
const { sqlQuery } = require('../../Modules/sqlHandler');

module.exports = (dependencies) => {
  return async (req, res, next) => {
    try {
      const { search, page, limit } = req.query;
      const { userID } = req.params;

      const _page = page ? page : 1;
      const _limit = limit ? limit : 10;
      const _search = search ? search : '';
      const offset = (_page - 1) * _limit;

      var projects = await sqlQuery(
        `SELECT DISTINCT p.* 
                      FROM db_projects p
                      INNER JOIN db_tasks t ON t.taskProjectID = p.projectID
                      INNER JOIN db_task_assignments ta ON ta.task_id = t.taskID
                      INNER JOIN db_users u ON u.userID = ta.assigned_to || u.userID = ta.assigned_by
                      WHERE u.userID = '${userID}' AND p.name LIKE '%${_search}%'
                      LIMIT ${_limit} OFFSET ${offset};`,
        []
      );

      const totalCount = await sqlQuery(
        `SELECT COUNT(DISTINCT p.projectID) AS count
                      FROM db_projects p
                      INNER JOIN db_tasks t ON t.taskProjectID = p.projectID
                      INNER JOIN db_task_assignments ta ON ta.task_id = t.taskID
                      INNER JOIN db_users u ON u.userID = ta.assigned_to || u.userID = ta.assigned_by
                      WHERE u.userID = '${userID}' AND p.name LIKE '%${_search}%'`,
        []
      );


      if (projects.length > 0) {
        projects[projects.length - 1].haveMore = totalCount[0].count > _page * _limit;
        projects[projects.length - 1].totalCount = totalCount[0].count;
      }


      if (projects.length === 0) {
        res.status(201).json({ success: false, message: 'No Projects Assigned to you' });
      } else {
        res.status(200).json({ success: true, message: 'Projects found successfully!', data: projects });
      }
    } catch (error) {
      res.status(400).json({ success: false, message: `Error Editing project StackTrace: ${error}` });
    }
  };
};
