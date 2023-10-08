import express from 'express';
import * as EmailValidator from 'email-validator';
import { isValidPassword } from '../../controllers/index.js';
import { OrganizationAdmin } from '../../db/entities/OrganizationAdmin.js';
import createError from 'http-errors';


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

    errorList.push(...isValidPassword(organizationAdmin.password));

    if (errorList.length) {
        res.status(400).send(errorList);
    } else {
        next();
    }
}

const validateAdminEdited = async (req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    const organizationAdmin = req.body;
    const errorList = [];

    const id = req.params.id.toString();
    const v = await OrganizationAdmin.findOne({ where: { id } });
    if (!v) {
        //res.status(400).send("Id not valid");
        next(createError(404));
    }

    if (organizationAdmin.email) {
        if (!EmailValidator.validate(organizationAdmin.email)) {
            errorList.push('Email is not Valid');
        }
    }
    if (organizationAdmin.password)
        errorList.push(...isValidPassword(organizationAdmin.password));

    if (errorList.length) {
        res.status(400).send(errorList);
    } else {
        next();
    }
}

const validateAdminId = async (req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    const id = req.params.id.toString();
    const p = await OrganizationAdmin.findOne({ where: { id } });
    if (!p) {
        //res.status(400).send("Id not valid");
        next(createError(404));
    } else {
        next();
    }
}

export {
    validateOrganizationAdmin,
    validateAdminEdited,
    validateAdminId
}