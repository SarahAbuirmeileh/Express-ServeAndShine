import express from 'express';
import { Role } from '../../db/entities/Role.js';
import createError from 'http-errors';
import { NSLogs } from '../../../types/logs.js';
import { log } from '../../controllers/dataBaseLogger.js';

const validateRole = (req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    const values = ['name', "permissionsId"];
    const role = req.body;
    const errorList = values.map(key => !role[key] && `${key} is Required!`).filter(Boolean);

    if (!['root', 'admin', 'volunteer', 'premium'].includes(role.name)) {
        errorList.push('role name unknown!');
    }

    if (errorList.length) {
        log({
            userId: res.locals.organizationAdmin?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: (res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Bad Role Request'
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

const validateEditedRole = async (req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    const role = req.body;
    const errorList = [];

    const id = Number(req.params.id.toString());
    const r = await Role.findOne({ where: { id } });
    if (!r) {
        log({
            userId: res.locals.organizationAdmin?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: (res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Invalid Role id'
        }).then(() => {
            console.log('logged');
        }).catch(err => {
            console.log('NOT logged');
        })
        next(createError(404, "Role"));
    }

    if (role.name) {
        if (!['root', 'admin', 'volunteer', 'premium'].includes(role.name)) {
            errorList.push('role name unknown!');
        }
    }

    if (errorList.length) {
        log({
            userId: res.locals.organizationAdmin?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: (res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Bad Role Request'
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
const validateRoleId = async (req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    const id = Number(req.params.id.toString());
    const p = await Role.findOne({ where: { id } });
    if (!p) {
        log({
            userId: res.locals.organizationAdmin?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: (res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Invalid Role id'
        }).then(() => {
            console.log('logged');
        }).catch(err => {
            console.log('NOT logged');
        })
        next(createError(404, "Role"));
    } else {
        next();
    }
}


export {
    validateRole,
    validateEditedRole,
    validateRoleId
}