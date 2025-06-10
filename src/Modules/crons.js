require('dotenv').config(); // Load env variables
const scheduleDailyReminder = require('./cronJobs/dailyReminder');
const { scheduleAllRemindersForToday } = require('./cronJobs/taskReminderScheduler');


module.exports.initializeCron = () => {
    if (process.env.ENABLE_CRON === 'true') {
        console.log('\x1b[32m%s\x1b[0m', '\n\n>>> Cron is enabled. Scheduling jobs... \n\n');
        scheduleDailyReminder();
        scheduleAllRemindersForToday();
    } else {
        console.log('\x1b[31m Cron is disabled via environment settings. \x1b[0m');
    }
};
