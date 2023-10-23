import AWS from 'aws-sdk';

const configureSES = async () => {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!accessKeyId || !secretAccessKey) {
        throw 'AWS information to concent are missing :('
    }

    AWS.config.update({
        credentials: {
            accessKeyId,
            secretAccessKey,
        },
        region: process.env.AWS_REGION,
    });

    return new AWS.SES();
}

export { configureSES };