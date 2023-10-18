import { SendEmailCommand } from "@aws-sdk/client-ses";
import { SESClient } from "@aws-sdk/client-ses";
const sesClient = new SESClient({ region: process.env.AWS_REGION });

const createSendEmailCommand = (recEmail: string, name: string, subject: string, body: string) => {
  return new SendEmailCommand({
    Destination: {
      CcAddresses: [],
      ToAddresses: [
        recEmail
      ],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `Hello, ${name}. ${body}`
        },
        Text: {
          Charset: "UTF-8",
          Data: `...`
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject
      },
    },
    Source: "tamimitarteel@gmail.com",
    ReplyToAddresses: []
  });
};

const sendEmail = async (email: string, name: string, subject: string, body: string) => {
  const sendEmailCommand = createSendEmailCommand(
    email,
    name,
    subject,
    body
  );

  try {
    return await sesClient.send(sendEmailCommand);
  } catch (e) {
    console.error("Failed to send email.");
    return e;
  }
};

export { sendEmail };