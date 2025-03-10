const userUseCase = require('./userUseCase');
module.exports = (dependencies) => {
  return async (req, res, next) => {
    try {
      const {search} = req.query;
      const userDetails = await userUseCase.getAllUsers(search);
      res.status(200);
      res.send({ status: true, msg: 'success', data: userDetails });
    } catch (error) {
      res.status(400).json({ message: 'No users found' });
    }
  };
};
