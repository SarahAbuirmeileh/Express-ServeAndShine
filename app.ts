import "./config.js"
import swaggerUi from 'swagger-ui-express';
import express from 'express'
import dotenv from 'dotenv'
import createError from 'http-errors'
import { initDB } from './src/db/dataSource.js'
import logger from 'morgan'
import cookieParser from 'cookie-parser'
import fileUpload from 'express-fileupload';

import indexRouter from "./src/routes/index.js"
import permissionRouter from "./src/routes/permission.js"
import roleRouter from "./src/routes/role.js"
import voluntaryWorkRouter from "./src/routes/voluntaryWork.js"
import organizationAdminRouter from "./src/routes/organizationAdmin.js"
import organizationProfileRouter from "./src/routes/organizationProfile.js"
import volunteerRouter from "./src/routes/volunteer.js"
import { authenticate } from "./src/middleware/auth/authenticate.js"
import { errorHandler } from "./src/middleware/errorHandler/errorHandler.js"
import { swaggerSpec } from "./swaggerConfig.js";

const app = express();
dotenv.config();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(fileUpload({ limits: { fileSize: 50 * 1024 * 1024 } }))
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/health", function (req, res) {
  res.sendStatus(200);
})

app.use('/', indexRouter);
app.use('/permission', authenticate, permissionRouter);
app.use('/role', authenticate, roleRouter);
app.use('/voluntaryWork', authenticate, voluntaryWorkRouter);
app.use('/organizationAdmin', organizationAdminRouter);
app.use('/organizationProfile', authenticate, organizationProfileRouter);
app.use("/volunteer", volunteerRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404, "The page"));
});

app.use(errorHandler);

app.listen(PORT, () => {
  logger(`App is listening on port ${PORT}`);
  console.log(`App is listening on port ${PORT}`);
  initDB();
});

export default app;
