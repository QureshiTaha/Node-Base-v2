const cron = require('node-cron');
const db = require('../sqlHandler');
const notification = require('../notification');
const taskCronRegistry = require('./cronRegistry');
const taskUseCase = require('../../controllers/task/taskUseCase');
const logsUseCase = require('../../controllers/Logs/logs.UseCase');

const REMINDER_LABELS = {
    MORNING: 'morning',
    ACTUAL: 'actual',
};

// 1. Schedules all today's reminders once at startup or midnight
async function scheduleAllRemindersForToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    try {
        const tasks = await db.sqlQuery(
            `SELECT t.*, u.fcmToken 
             FROM db_tasks t 
             JOIN db_users u ON t.created_by = u.userID 
             WHERE t.reminder_date >= ? AND t.reminder_date < ? AND t.isDeleted = '0'`,
            [today, tomorrow]
        );

        tasks.forEach(scheduleOrUpdateReminder);
        console.log(`Scheduled ${tasks.length} reminders.`);
    } catch (err) {
        console.error('Failed to schedule today’s reminders:', err);
    }
}

// 2. Schedule or update a single task reminder
async function scheduleOrUpdateReminder(_task) {

    console.log(_task, "MYInput");

    let task = _task;

    // If only taskID provided or partial object
    if ((!task.fcmToken || !task.reminder_date) && task.taskID) {
        try {
            const rows = await db.sqlQuery(
                `SELECT t.*, u.fcmToken 
                 FROM db_tasks t 
                 JOIN db_users u ON t.created_by = u.userID 
                 WHERE t.taskID = ?`,
                [task.taskID]
            );
            console.log(`Fetched task ${task.taskID} for scheduling`, rows);
            task = rows[0];

        } catch (err) {
            console.error(`Failed to fetch task ${task.taskID} for scheduling`, err);
            return;
        }
    }

    // Validate final task object
    if (!task || !task.reminder_date || !task.fcmToken) {
        console.log(`Skipping task ${task?.taskID}: missing reminder_date or fcmToken`, task);
        return;
    }

    const actualReminder = new Date(task.reminder_date);
    const actualTime = formatTime(actualReminder);
    const morningTime = '10:15';

    scheduleReminder(task, morningTime, REMINDER_LABELS.MORNING);
    scheduleReminder(task, actualTime, REMINDER_LABELS.ACTUAL);
}

// 3. Internal method to handle scheduling and registry
function scheduleReminder(task, timeStr, label) {
    const [hour, minute] = timeStr.split(':').map(Number);
    const cronTime = `${minute} ${hour} * * *`;
    const taskKey = `${task.taskID}_${label}`;

    cancelReminder(taskKey); // Avoid duplicate scheduling

    const job = cron.schedule(cronTime, async () => {
        console.log(`[Reminder] ${label} | Task ${task.taskID}`);
        const allUserIDs = await taskUseCase.getAllUsersByTaskID(task.taskID);

        if (allUserIDs.success && allUserIDs.data.length) {
            for (let i = 0; i < allUserIDs.data.length; i++) {
                if (allUserIDs.data[i]) {
                    console.log(allUserIDs.data[i], "USER:");

                    await notification.push({
                        title: 'Task Reminder Updated',
                        body: `Hi, You have a task reminder`,
                        userID: allUserIDs.data[i],
                        data: {
                            type: label === REMINDER_LABELS.ACTUAL ? 'task_reminder' : 'daily_task_reminder',
                            taskID: task.taskID,
                        }
                    });

                    if (label === REMINDER_LABELS.ACTUAL) {
                        await logsUseCase.addLogs({
                            taskID: task.taskID,
                            userID: allUserIDs.data[i],
                            message: `You have a task reminder`,
                            log_type: 'system'
                        });
                    }
                }
            }
        }
    });

    taskCronRegistry.set(taskKey, job);
    console.log(`Scheduled ${label} reminder for task ${task.taskID} at ${timeStr}`);
}

// 4. Cancel reminder from registry
function cancelReminder(taskKey) {
    const job = taskCronRegistry.get(taskKey);
    if (job) {
        job.stop();
        taskCronRegistry.delete(taskKey);
        console.log(`Cancelled reminder: ${taskKey}`);
    }
}

// 5. Helper: formats a Date object into 'HH:MM'
function formatTime(date) {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

module.exports = {
    scheduleAllRemindersForToday,
    scheduleOrUpdateReminder,
};
