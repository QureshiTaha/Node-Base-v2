module.exports = (dependencies) => {
  return async (req, res, next) => {
    try {
      const { search, page, limit, filterByProjectID, filterByTag } = req.query;
      const { userID } = req.params;

      if (!userID) {
        return res.status(400).json({ success: false, message: 'UserID is required' });
      }

      const _page = Number(page || 1);
      const _limit = Number(limit || 10);
      const _search = search ? `%${search}%` : '';
      const offset = (_page - 1) * _limit;
      const projectID = filterByProjectID ? filterByProjectID : '';
      const tag = filterByTag ? filterByTag : '';

      // Build dynamic search condition
      const searchCondition = _search
        ? ` AND (db_tasks.title LIKE '%${search}%' OR db_tasks.description LIKE '%${search}%') `
        : '';


      const projectIDCondition = projectID ? ` AND db_tasks.taskProjectID = '${projectID}' ` : '';
      const tagCondition = tag ? ` AND db_tasks.tag_name like '%${tag}%' ` : '';

      // Complete query with search and pagination
      const query = `
              SELECT 
                db_tasks.*, 
                CONCAT(TRIM(COALESCE(db_users.userFirstName, '')), ' ', TRIM(COALESCE(db_users.userSurname, ''))) AS created_by_UserName, 
                db_projects.name AS projectName 
              FROM db_tasks
              LEFT JOIN db_users ON db_tasks.created_by = db_users.userID
              LEFT JOIN db_projects ON db_tasks.taskProjectID = db_projects.projectID
              LEFT JOIN db_task_assignments ON db_tasks.taskID = db_task_assignments.task_id
              WHERE ( 
                db_task_assignments.assigned_to = '${userID}' 
                OR db_task_assignments.assigned_by = '${userID}' 
                OR db_tasks.created_by = '${userID}' 
              ) AND db_tasks.isDeleted = '0'
              ${searchCondition}
              ${projectIDCondition}
              ${tagCondition}
              ORDER BY db_tasks.created_at DESC
              LIMIT ${limit} OFFSET ${offset}
            `;

      const totalCountQuery = `
              SELECT COUNT(DISTINCT db_tasks.taskID) AS count
              FROM db_tasks
              LEFT JOIN db_task_assignments ON db_tasks.taskID = db_task_assignments.task_id
              WHERE (
                db_task_assignments.assigned_to = '${userID}'
                OR db_task_assignments.assigned_by = '${userID}'
                OR db_tasks.created_by = '${userID}' 
              ) AND db_tasks.isDeleted = '0'
              ${searchCondition}
              ${projectIDCondition}
              ${tagCondition}
      `;


      // Fetch tasks
      const tasks = await sqlQuery(query, []);
      // Fetch total count
      const totalCountResult = await sqlQuery(totalCountQuery, []);
      const totalCount = totalCountResult[0]?.count || 0;

      // Remove duplicate tasks based on taskID
      const uniqueTasksMap = new Map();
      tasks.forEach(task => {
        if (!uniqueTasksMap.has(task.taskID)) {
          uniqueTasksMap.set(task.taskID, task);
        }
      });
      const uniqueTasks = Array.from(uniqueTasksMap.values());

      // Determine if there are more tasks
      const haveMore = totalCount > _page * _limit;

      // Add pagination info to the last task
      if (uniqueTasks.length > 0) {
        uniqueTasks[uniqueTasks.length - 1].haveMore = haveMore;
        uniqueTasks[uniqueTasks.length - 1].totalCount = totalCount;
      }

      if (uniqueTasks.length === 0) {
        res.status(200).json({ success: false, message: 'Not found any related Tasks', data: uniqueTasks });
      } else {
        res.status(200).json({ success: true, message: 'Tasks found successfully!', data: uniqueTasks });
      }
    } catch (error) {
      console.error(error);
      res.status(400).json({ success: false, message: `Error fetching tasks. StackTrace: ${error}` });
    }
  };
};