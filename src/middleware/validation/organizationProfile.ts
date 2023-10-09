import express from 'express';
import { OrganizationProfile } from '../../db/entities/OrganizationProfile.js';
import createError from 'http-errors';
import { NSLogs } from '../../../types/logs.js';
import { log } from '../../controllers/logs.js';

const validateOrganizationProfile = (req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    const values = ["name", "description"];
    const organizationProfile = req.body;
    const errorList = values.map(key => !organizationProfile[key] && `${key} is Required!`).filter(Boolean);

    if (errorList.length) {
        log({
            userId: res.locals.organizationAdmin?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: (res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Bad Organization Profile Request'
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

const validateOrgId = async (req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    const id = req.params.id.toString();
    const v = await OrganizationProfile.findOne({ where: { id } });
    if (!v) {
        log({
            userId: res.locals.organizationAdmin?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: (res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Bad Organization Profile Request'
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
    validateOrganizationProfile,
    validateOrgId
}