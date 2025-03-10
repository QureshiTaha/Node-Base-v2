const express = require('express');
const testing = require('./testing');
const users = require('./users');

const router = express.Router();
router.use("/uploads", require("./uploads"));
router.use('/testing', testing);
router.use('/users', users);

module.exports = router;
