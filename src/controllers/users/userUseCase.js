const sql = require('../../Modules/sqlHandler');
sqlQuery = sql.query;
const moment = require('moment');
const bcrypt = require('bcrypt');


/**
* hashPassword function to hash encrypt the password
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

module.exports = {
  addUser: async function (user) {
    try {
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
  updatePassword: async function (user) {
    try {
      user.hashPassword = await hashPassword(user.userPassword);
      const updatePassword = await sqlQuery(
        `UPDATE db_users SET 
          userPassword = '${user.hashPassword}'
        WHERE userID = '${user.userID}'`
      );
      if (updatePassword) return user;
      return null;
    } catch (error) {
      throw new Error(`Could not update user with userID:${user.userID} ${error}`);
    }
  },
  deleteUser: async function (user) {
    try {
      const userDeletedDate = moment().format('YYYY-MM-DD HH:mm:ss');
      const updatePassword = await sqlQuery(
        `UPDATE db_users SET 
          userDeleted = '1',
          userDeletedDate = '${userDeletedDate}'
        WHERE userID = '${user.userID}'`
      );
      if (updatePassword) return user;
      return null;
    } catch (error) {
      throw new Error(`Could not update user with userID:${user.userID} ${error}`);
    }
  },
  getUserByUserID: async function (userID) {
    try {
      const user = await sqlQuery(`SELECT * from db_users WHERE userID='${userID}'`);
      if (user) return user;
      return null;
    } catch (error) {
      return error;
    }
  },
  getFcmTokenByUserID: async function (userID) {
    try {
      const fcmToken = await sqlQuery(`SELECT fcmToken from db_users WHERE userID='${userID}'`);
      if (fcmToken) return fcmToken;
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
      const userList = await sqlQuery(
        `SELECT * from db_users where userFirstName like '%${search}%' or userSurname like '%${search}%' or userEmail like '%${search}%'
        or userPhone like '%${search}%' AND (userDeleted IS NULL OR userDeleted != 1)`
      );
      if (userList) return userList;
      return null;
    } catch (error) {
      return error;
    }
  },
  checkIfExist: async function (userID) {
    try {
      const query = `SELECT count(1) as count FROM db_users WHERE userID =  ? AND (userDeleted IS NULL OR userDeleted != 1)`;
      const result = await sqlQuery(query, [userID]);
      console.log(result[0].count);

      if (result.length > 0 && result[0].count > 0) {
        return { success: true, data: result[0] };
      } else {
        return { success: false, message: 'User not found' };
      }
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return { success: false, message: error.message };
    }
  }
};
