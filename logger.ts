import winston from "winston";

const baseLogger = winston.createLogger({
  format: winston.format.json(),
  defaultMeta: { project: 'serve and shine', time: new Date() },
  transports: [
    new winston.transports.File({ filename: 'logger/error.log', level: 'error' }),
    //new winston.transports.File({ filename: 'logger/all.log' }),
  ],
});

export default baseLogger;