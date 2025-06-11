const getAllTasksController = require('./getAllTask.controller');
const addTaskController = require('./addTask.controller');
const getTaskByIDController = require('./getTaskByID.controller');
const deleteTaskController = require('./deleteTask.controller');
const assignTaskController = require('./assignTask.controller');
const TaskAssignedToMeController = require('./getTaskAssignedToMe.controller');
const updateTaskController = require('./updateTask.controller');
const tagsControllers = require('./tags.controllers');
module.exports = (dependencies) => {
  return {
    getAllTasksController: getAllTasksController(dependencies),
    TaskAssignedToMeController: TaskAssignedToMeController(dependencies),
    getTaskByIDController: getTaskByIDController(dependencies),
    addTaskController: addTaskController(dependencies),
    deleteTaskController: deleteTaskController(dependencies),
    assignTaskController: assignTaskController(dependencies),
    updateTaskController: updateTaskController(dependencies),
    tagsControllers: tagsControllers(dependencies),
  };
};
