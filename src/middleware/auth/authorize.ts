import express from 'express';
import { NSPermission } from '../../../types/permission.js';
import { OrganizationAdmin } from '../../db/entities/OrganizationAdmin.js';
import { Volunteer } from '../../db/entities/Volunteer.js';
import { OrganizationProfile } from '../../db/entities/OrganizationProfile.js';

const authorize = (api: string) => {
    return async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {

        const permissions: NSPermission.Item[] = [];

        if (res.locals.organizationAdmin) {
            const organizationAdmin: OrganizationAdmin = res.locals.organizationAdmin;
            permissions.push(...organizationAdmin.roles.permissions);

        } else if (res.locals.volunteer) {
            const volunteer: Volunteer = res.locals.volunteer;
            volunteer.roles.forEach((role) => {
                permissions.push(...role.permissions);
            });
        }

        if (permissions?.filter(p => p.name === api).length > 0 || (/^PUT_.+/.test(api)) || (/^DELETE_.+/.test(api))) {
            next();
        } else {
            res.status(403).send("You don't have the permission to access this resource!");
        }
    }
}

const checkMe = () => {
    return (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        const id = req.params.id;
        if (res.locals.volunteer) {
            if (res.locals.volunteer.id == id) {
                next()
            }
        } else if (res.locals.organizationAdmin) {
            if (res.locals.organizationAdmin.id == id) {
                next();
            } else {
                res.status(403).send("You don't have the permission to access this resource!");
            }
        }
    }
}

const checkAdmin = () => {
    return async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        const id = req.params.id;
        let organizationProfile = await OrganizationProfile.findOne({ where: { id } });
        const admin =  await OrganizationAdmin.findOne({ where: { orgProfile: { id: organizationProfile?.id } } });
        if (res.locals.organizationAdmin) {
            if (res.locals.organizationAdmin.id == admin?.id) {
                next();
            } else {
                res.status(403).send("You don't have the permission to access this resource!");
            }
        }
    }
}

const checkCreator = () => {
    return async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        const id = req.params.id;
        let organizationProfile = await OrganizationProfile.findOne({ where: { id } });
        const admin =  await OrganizationAdmin.findOne({ where: { orgProfile: { id: organizationProfile?.id } } });
        if (res.locals.organizationAdmin) {
            if (res.locals.organizationAdmin.id == admin?.id) {
                next();
            } else {
                res.status(403).send("You don't have the permission to access this resource!");
            }
        }
    }
}

const checkParticipation = () => {
    return async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {

    }
}

export {
    authorize,
    checkMe,
    checkAdmin,
    checkCreator,
    checkParticipation
}