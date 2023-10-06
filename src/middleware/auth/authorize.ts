import express from 'express';
import { NSPermission } from '../../../types/permission.js';
import { OrganizationAdmin } from '../../db/entities/OrganizationAdmin.js';
import { Volunteer } from '../../db/entities/Volunteer.js';

const authorize = (api: string) => {
    return async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {

        const permissions: NSPermission.Item[] = [];

        if (res.locals.organizationAdmin) {
            const organizationAdmin:OrganizationAdmin = res.locals.organizationAdmin;
            permissions.push(...organizationAdmin.roles.permissions);

        } else if (res.locals.volunteer) {
            const volunteer:Volunteer = res.locals.volunteer;
            volunteer.roles.forEach((role) => {
                permissions.push(...role.permissions);
            });
        }

        if (permissions?.filter(p => p.name === api).length > 0) {
            next();
        } else {
            res.status(403).send("You don't have the permission to access this resource!");
        }
    }
}

export {
    authorize
}