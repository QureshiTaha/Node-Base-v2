const userUseCase = require('./userUseCase');
module.exports = (dependencies) => {
  return async (req, res, next) => {
    try {
      const {userEmail} = req.params;
      const userDetails = await userUseCase.getUserByUserEmail(userEmail);
      res.status(200);
      res.send({ status: true, msg: 'success', data: userDetails });
    } catch (error) {
      res.status(400).json({ message: 'No users found' });
    }
  };
};
