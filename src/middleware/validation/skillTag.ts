import express from 'express';

const validatePermission = (req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const values = ["name"];
  const skillTag = req.body;
  const errorList = values.map(key => !skillTag[key] && `${key} is Required!`).filter(Boolean);

  if (errorList.length) {
    res.status(400).send(errorList);
  } else {
    next();
  }
}

export {
    validatePermission
}