const moment = require('moment');
const { sqlQuery } = require('../../Modules/sqlHandler');

module.exports = (dependencies) => {
  return async (req, res, next) => {
    try {
      const { search, page, limit } = req.query;

      const _page = page ? page : 1;
      const _limit = limit ? limit : 10;
      const _search = search ? search : '';

      var projects = await sqlQuery(
        `SELECT * FROM db_projects WHERE name LIKE '%${_search}%' Order By id DESC LIMIT ${_limit} OFFSET ${(_page - 1) * _limit}`
      );
      // check total count and haveMore bool
      const totalCount = await sqlQuery(`SELECT count(1) as count FROM db_projects WHERE name LIKE '%${_search}%'`);


      if (projects.length > 0) {
        projects[projects.length - 1].haveMore = totalCount[0].count > _page * _limit;
        projects[projects.length - 1].totalCount = totalCount[0].count;
      }


      if (projects.length === 0) {
        res.status(400).json({ success: false, message: 'Projects not found' });
      } else {
        res.status(200).json({ success: true, message: 'Projects found successfully!', data: projects });
      }
    } catch (error) {
      res.status(400).json({ success: false, message: `Error Editing project StackTrace: ${error}` });
    }
  };
};
