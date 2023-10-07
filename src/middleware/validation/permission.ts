import express from 'express';
import { Permission } from '../../db/entities/Permission.js';
import createError from 'http-errors';

const validatePermission = (req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const values = ["name"];
  const permission = req.body;
  const errorList = values.map(key => !permission[key] && `${key} is Required!`).filter(Boolean);

  if (errorList.length) {
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
      //res.status(400).send("Id not valid");
      next(createError(404));
  }else{
      next();
  }
}

export {
    validatePermission,
    validatePermissionId
}