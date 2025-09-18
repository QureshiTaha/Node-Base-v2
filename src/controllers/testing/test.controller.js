const notification = require("../../Modules/notification");

module.exports = (dependencies) => {
  return async (req, res) => {
    const {userID} = req.params;
    if(userID){
      await notification.push({
        title: 'Test Notification',
        body: 'This is a test notification',
        userID,
        data: {
          type: 'test',
        }
      });
      return res.status(200).json({
        status: true,
        msg: 'Notification sent',
        data: ''
      });
    }
    res.status(200).json({
      status: true,
      msg: 'testing Data',
      data: ''
    });
  };
};
