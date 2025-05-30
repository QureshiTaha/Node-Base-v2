const express = require('express');
const testing = require('./testing');
const users = require('./users');
const projects = require('./projects');
const tasks = require('./tasks');
const logs = require('./logs');
const chats = require('./chats');

const router = express.Router();
router.use('/uploads', require('./uploads'));
router.use('/testing', testing);
router.use('/users', users);
router.use('/projects', projects);
router.use('/tasks', tasks);
router.use('/logs', logs);
router.use('/chats', chats);

module.exports = router;
