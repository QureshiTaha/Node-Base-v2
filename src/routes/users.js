const express = require('express');
const { userController, testController } = require('../controllers');
const verifyToken = require('../Modules/authJwt');
const refreshToken = require('../Modules/refreshToken');
const {
  loginController,
  signupController,
  logoutController,
  editUserController,
  getAllUsersController,
  getUserByUserEmailController,
  getUserByUserPhoneController
} = userController();

const { testingController } = testController();

const router = express.Router();
router.route('/').get(testingController);
router.route('/refresh-token').post(refreshToken);
router.route('/login').post(loginController);
router.route('/signup').post(signupController);
router.route('/logout').delete(logoutController);
router.route('/allUsers').get(verifyToken, getAllUsersController);
router.route('/getUserByEmail/:userEmail').get(getUserByUserEmailController);
router.route('/getUserByPhone/:userPhone').get(getUserByUserPhoneController);
router.route('/update-user').post(editUserController);
router.route('/test').get(testingController);

module.exports = router;
