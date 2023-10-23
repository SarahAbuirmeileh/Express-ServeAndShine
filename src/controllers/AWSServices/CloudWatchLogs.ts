import { configureCloudWatch } from '../../utilities/AWSConfigureCloudWatch.js';

const cloudWatchLogs = await configureCloudWatch();

if (!cloudWatchLogs) {
    throw new Error('CloudWatch Logs initialization failed!');
}

export const logToCloudWatch = async (logGroupName:string, logStreamName:string, logMessage:string, id:string, name:string) => {
    const logEvent = {
        message: `${logMessage}\n- User ID: ${id}, User Name: ${name}`,
        timestamp: new Date().getTime(),
    };

    const params = {
        logGroupName: logGroupName,
        logStreamName: logStreamName,
        logEvents: [logEvent],
    };

    try {
        await cloudWatchLogs.putLogEvents(params).promise();
        console.log('Log event sent successfully');
    } catch (error) {
        console.error('Error sending log event:', error);
    }
};