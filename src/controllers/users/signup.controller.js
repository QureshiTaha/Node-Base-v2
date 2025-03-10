const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const userUseCase = require('./userUseCase');

module.exports = (dependencies) => {
  return async (req, res, next) => {
    try {
      const userID = uuidv4();
      const userFirstName = req.body.userFirstName;
      const userSurname = req.body.userSurname;
      const userEmail = req.body.userEmail;
      const userPassword = req.body.userPassword;
      const userPhone = req.body.userPhone;
      const userAddressLine1 = req.body.userAddressLine1;
      const userAddressLine2 = req.body.userAddressLine2;
      const userAddressPostcode = req.body.userAddressPostcode;
      const userGender = req.body.userGender;
      const userDateOfBirth = req.body.userDateOfBirth;
      const userRole = req.body.userRole || 1;
      const userDateJoined = req.body.userDateJoined;
      const userDateUpdated = req.body.userDateUpdated;
      const userLastLoggedIn = req.body.userLastLoggedIn;
      const userAccountApproved = req.body.userAccountApproved || 1;
      const userDeletedDate = req.body.userDeletedDate;
      const userMeta = req.body.userMeta || {};
      let dataStore = {};
      if (!userPassword || !userEmail) {
        throw new Error('Please enter valid email and password');
      } else {
        dataStore.userID = userID;
        dataStore.userPassword = userPassword;
        dataStore.userFirstName = userFirstName;
        dataStore.userSurname = userSurname;
        dataStore.userEmail = userEmail;
        dataStore.userPhone = userPhone;
        dataStore.userAddressLine1 = userAddressLine1;
        dataStore.userAddressLine2 = userAddressLine2;
        dataStore.userAddressPostcode = userAddressPostcode;
        dataStore.userGender = userGender;
        dataStore.userDateOfBirth = moment(userDateOfBirth).format('yyyy-MM-DD');
        dataStore.userRole = userRole;
        dataStore.userDateJoined = moment(userDateJoined).format('yyyy-MM-DD');
        dataStore.userDateUpdated = moment(userDateUpdated).format('yyyy-MM-DD');
        dataStore.userLastLoggedIn = moment(userLastLoggedIn).format('yyyy-MM-DD');
        dataStore.userAccountApproved = userAccountApproved;
        dataStore.userDeletedDate = moment(userDeletedDate).format('yyyy-MM-DD');
        dataStore.userMeta = userMeta;

        const response = await userUseCase.addUser(dataStore);

        res.send({ status: true, msg: 'success', content: response });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({ status: false, msg: error.toString() });
    }
  };
};
