const loginController = require("./login.controller");
const signupController = require("./signup.controller");
const logoutController = require("./logout.controller");
const editUserController = require("./editUser.controller");
const getAllUsersController = require("./getAllUsers.controller");
const getUserByUserEmailController = require("./getUserByUserEmail.controller.js");
const getUserByUserPhoneController = require("./getUserByUserPhone.controller");
const changePasswordController = require("./changePassword.controller.js");
const deleteUsersController = require("./deleteUsers.controller");

module.exports = (dependencies) => {
    return {
        loginController: loginController(dependencies),
        signupController: signupController(dependencies),
        logoutController: logoutController(dependencies),
        editUserController: editUserController(dependencies),
        getAllUsersController: getAllUsersController(dependencies),
        getUserByUserEmailController: getUserByUserEmailController(dependencies),
        getUserByUserPhoneController: getUserByUserPhoneController(dependencies),
        changePasswordController: changePasswordController(dependencies),
        deleteUsersController: deleteUsersController(dependencies)
    }
}