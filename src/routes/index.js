const express = require('express');
const testing = require('./testing');
const reels = require('./reels');
const coins = require('./coin');
const users = require('./users');
const projects = require('./projects');
const tasks = require('./tasks');
const logs = require('./logs');
const follow = require('./follow');

const router = express.Router();
router.use('/uploads', require('./uploads'));
router.use('/testing', testing);
router.use('/reels', reels);
router.use('/coins', coins);
router.use('/users', users);
router.use('/projects', projects);
router.use('/tasks', tasks);
router.use('/logs', logs);
router.use('/follow', follow);

module.exports = router;
