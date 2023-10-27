import express from 'express';
import * as EmailValidator from 'email-validator';
import { isValidPassword } from '../../controllers/index.js';
import { OrganizationAdmin } from '../../db/entities/OrganizationAdmin.js';
import createError from 'http-errors';
import { NSLogs } from '../../../types/logs.js';
import { log } from '../../controllers/dataBaseLogger.js';


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
        log({
            userId: res.locals.organizationAdmin?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: (res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Bad Organization Admin Request'
        }).then().catch()
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
        log({
            userId: res.locals.organizationAdmin?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: (res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Bad Organization Admin Request'
        }).then().catch()
        next(createError(404, "Organization admin"));
    }

    if (organizationAdmin.email) {
        if (!EmailValidator.validate(organizationAdmin.email)) {
            errorList.push('Email is not Valid');
        }
    }
    if (organizationAdmin.password)
        errorList.push(...isValidPassword(organizationAdmin.password));

    if (errorList.length) {
        log({
            userId: res.locals.organizationAdmin?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: (res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Bad Organization Admin Request'
        }).then().catch()
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
        log({
            userId: res.locals.organizationAdmin?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: (res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Bad Organization Admin Request'
        }).then().catch()
        next(createError(404, "Organization admin"));
    } else {
        next();
    }
}

export {
    validateOrganizationAdmin,
    validateAdminEdited,
    validateAdminId
}