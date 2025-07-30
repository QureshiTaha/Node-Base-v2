const userUseCase = require('./userUseCase');

module.exports = (dependencies) => {
  return async (req, res) => {
    try {
      const { search = "" } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      // Fetch paginated users
      const { users, totalCount } = await userUseCase.getAllUsers(search, limit, offset);

      const haveMore = offset + limit < totalCount;

      res.status(200).json({
        status: true,
        msg: "success",
        data: {
          users,
          totalCount,
          haveMore,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "No users found" });
    }
  };
};
