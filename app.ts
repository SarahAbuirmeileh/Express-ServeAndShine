import "./config.js"
import express from 'express'
import dotenv from 'dotenv'
import createError from 'http-errors'
import dataSource, { initDB } from './src/db/dataSource.js'
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

const app = express();
dotenv.config();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(fileUpload({ limits: { fileSize: 50 * 1024 * 1024 } }))


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

const errorHandler = (
  error: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction) => {
  if (error.status == 404) {
    res.status(404).send("Something is not found");
  } else if (error.status == 401) {
    res.status(401).send("You are unautharized");
  } else if (error.status == 403) {
    res.status(401).send("You don't have the permission");
  } else {
    res.status(500).send('Something went wrong');
  }
}

// error handler
// app.use(function (err: any, req: any, res: any, next: any) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500).send({ error: err.message });
// });

app.use('/', indexRouter);
app.use('/permission', authenticate, permissionRouter);
app.use('/role', authenticate, roleRouter);
app.use('/voluntaryWork', authenticate, voluntaryWorkRouter);
app.use('/organizationAdmin', authenticate, organizationAdminRouter);
app.use('/organizationProfile', authenticate, organizationProfileRouter);
app.use("/volunteer", volunteerRouter);
app.use(errorHandler);

app.listen(PORT, () => {
  logger(`App is listening on port ${PORT}`);
  console.log(`App is listening on port ${PORT} and host http://localhost:${PORT}`);
  initDB();
});

export default app;
