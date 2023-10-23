import express from 'express';
import { Permission } from '../../db/entities/Permission.js';
import createError from 'http-errors';
import { NSLogs } from '../../../types/logs.js';
import { log } from '../../controllers/dataBaseLogger.js';

const validatePermission = (req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const values = ["name"];
  const permission = req.body;
  const errorList = values.map(key => !permission[key] && `${key} is Required!`).filter(Boolean);

  if (errorList.length) {
    log({
      userId: res.locals.organizationAdmin?.id,
      userName: res.locals.organizationAdmin?.name,
      userType: (res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
      type: 'failed' as NSLogs.Type,
      request: 'Bad Permission Request'
    }).then(() => {
      console.log('logged');
    }).catch(err => {
      console.log('NOT logged');
    })
    res.status(400).send(errorList);
  } else {
    next();
  }
}

const validatePermissionId = async (req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const id = Number(req.params.id.toString());
  const p = await Permission.findOne({ where: { id } });
  if (!p) {
    log({
      userId: res.locals.organizationAdmin?.id,
      userName: res.locals.organizationAdmin?.name,
      userType: (res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
      type: 'failed' as NSLogs.Type,
      request: 'Invalid Permission id'
    }).then(() => {
      console.log('logged');
    }).catch(err => {
      console.log('NOT logged');
    })
    next(createError(404));
  } else {
    next();
  }
}

export {
  validatePermission,
  validatePermissionId
}