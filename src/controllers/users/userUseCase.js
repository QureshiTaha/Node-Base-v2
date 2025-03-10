const { v4: uuidv4 } = require('uuid');
const database = require('../../Modules/config');
const sql = require('../../Modules/sqlHandler');
sqlQuery = sql.query;
const moment = require('moment');
const bcrypt = require('bcrypt');
module.exports = {
  addUser: async function (user) {
    try {
      /**
       * hashPassword function to hash the password
       * @param {*} userPassword
       * @returns
       */
      async function hashPassword(userPassword) {
        const password = userPassword;
        const saltRounds = 10;
        const hashedPassword = await new Promise((resolve, reject) => {
          bcrypt.genSalt(saltRounds, (err, salt) => {
            bcrypt.hash(password, salt, function (err, hash) {
              if (err) reject(err);
              resolve(hash);
            });
          });
        });
        return hashedPassword;
      }

      user.hashPassword = await hashPassword(user.userPassword);
      const addUser = await sqlQuery(
        `INSERT INTO db_users (
          userID,
          userFirstName,
          userSurname,
          userEmail,
          userPassword,
          userPhone,
          userDateOfBirth,
          userAddressLine1,
          userAddressLine2,
          userAddressPostcode,
          userGender,
          userRole,
          userMeta
          ) VALUES (
          '${user.userID}',
          '${user.userFirstName}',
          '${user.userSurname}',
          '${user.userEmail}',
          '${user.hashPassword}',
          '${user.userPhone}',
          '${user.userDateOfBirth}',
          '${user.userAddressLine1}',
          '${user.userAddressLine2}',
          '${user.userAddressPostcode}',
          '${user.userGender}',
          '${user.userRole}',
          '${typeof user.userMeta === 'object' ? JSON.stringify(user.userMeta) : user.userMeta}'
          );`
      );
      if (addUser) return user;
      return null;
    } catch (error) {
      throw new Error(`Could not add user with userID:${user.userID} ${error}`);
    }
  },
  getUserByUserID: async function (userID) {
    try {
      const driverOrderList = await sqlQuery(`SELECT * from db_users WHERE userID='${userID}'`);
      if (driverOrderList) return driverOrderList;
      return null;
    } catch (error) {
      return error;
    }
  },
  getUserByUserEmail: async function (userEmail) {
    try {
      const driverOrderList = await sqlQuery(`SELECT * from db_users WHERE userEmail='${userEmail}'`);
      if (driverOrderList) return driverOrderList;
      return null;
    } catch (error) {
      return error;
    }
  },
  getUserByUserPhone: async function (userPhone) {
    try {
      const driverOrderList = await sqlQuery(`SELECT * from db_users WHERE userPhone='${userPhone}'`);
      if (driverOrderList) return driverOrderList;
      return null;
    } catch (error) {
      return error;
    }
  },
  getAllUsers: async function (search = '') {
    try {
      const secretRoomUserList = await sqlQuery(
        `SELECT * from db_users where userFirstName like '%${search}%' or userSurname like '%${search}%' or userEmail like '%${search}%'
        or userPhone like '%${search}%'`
      );
      if (secretRoomUserList) return secretRoomUserList;
      return null;
    } catch (error) {
      return error;
    }
  }
};
