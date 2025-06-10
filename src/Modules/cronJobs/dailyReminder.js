const cron = require('node-cron');
const userUseCase = require('../../controllers/users/userUseCase');
const logsUseCase = require('../../controllers/Logs/logs.UseCase');
const notification = require('../notification'); // Adjust path as needed

const scheduleDailyReminder = () => {
    // cron.schedule('*/10 * * * * *', async () => { //for testing
    cron.schedule('0 18 * * *', async () => {
        console.log('Running daily task reminder cron at 6 PM');

        const allUsers = await userUseCase.getAllUsers();

        if (allUsers.length) {
            const actions = allUsers.map(async ({ userID, fcmToken }) => {
                if (fcmToken !== null) {
                    await notification.push({
                        title: 'Update Task Status',
                        body: `Please update your task progress before the end of the day.`,
                        userID,
                        fcm: fcmToken,
                        data: {
                            type: 'daily_task_reminder',
                        },
                    });
                }
            });

            await Promise.all(actions);
            console.log('Task reminders sent to all users. at 6 PM', new Date().toLocaleString());
        } else {
            console.log('No users found to notify.');
        }
    });
};

module.exports = scheduleDailyReminder;
