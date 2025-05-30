const express = require("express");
const { chatController } = require('../controllers');

const {
    sendMessage,
    getChatList,
    getMessages,
    addUserToGroup,
    createNewChat } = chatController()

const router = express.Router();
router.route("/new-chat").post(createNewChat);
router.route("/add-to-group").post(addUserToGroup);
router.route("/send-message").post(sendMessage);
router.route("/get-chat-list/:userID").get(getChatList);
router.route("/get-messages/:chatID").get(getMessages);


module.exports = router;
