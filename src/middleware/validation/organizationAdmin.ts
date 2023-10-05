import express from 'express';
import * as EmailValidator from 'email-validator';
import { isValidPassword } from '../../controllers/index.js';


const validateOrganizationAdmin = (req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    const values = ["name", "email", "password", "organizationId"];
    const organizationAdmin = req.body;
    const errorList = values.map(key => !organizationAdmin[key] && `${key} is Required!`).filter(Boolean);

    if (!EmailValidator.validate(organizationAdmin.email)) {
        errorList.push('Email is not Valid');
    }
    
    errorList.push(...isValidPassword(organizationAdmin.password ));

    if (errorList.length) {
        res.status(400).send(errorList);
    } else {
        next();
    }
}

export {
    validateOrganizationAdmin
}