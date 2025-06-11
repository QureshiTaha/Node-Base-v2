const express = require('express');
const { taskController } = require('../controllers');

const { getAllTasksController, addTaskController, updateTaskController, getTaskByIDController, deleteTaskController, assignTaskController, TaskAssignedToMeController, tagsControllers } =
  taskController();

const { addTag, removeTag, getTags, getTasksByTag } = tagsControllers;

const router = express.Router();
router.route('/').get(getAllTasksController);
router.route('/assigned-to-me/:userID').get(TaskAssignedToMeController);
router.route('/').post(addTaskController);
router.route('/get/:taskID').get(getTaskByIDController);
router.route('/assign').post(assignTaskController);
router.route('/add-tag').post(addTag);
router.route('/remove-tag/:tag_name').delete(removeTag);
router.route('/get-tags').get(getTags);
router.route('/by-tag/:tag_name').get(getTasksByTag);
router.route('/:taskID').put(updateTaskController);
router.route('/:taskID/:userID').delete(deleteTaskController);

module.exports = router;

