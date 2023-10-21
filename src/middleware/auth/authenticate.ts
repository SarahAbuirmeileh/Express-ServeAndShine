import express from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { OrganizationAdmin } from '../../db/entities/OrganizationAdmin.js';
import { Volunteer } from '../../db/entities/Volunteer.js';
import createError from 'http-errors';
import { NSLogs } from '../../../types/logs.js';
import { log } from '../../controllers/AWS-services/dataBase-logger.js';

const authenticate = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    const token = req.cookies['myApp'] || '';
    let tokenIsValid: JwtPayload | null | string;

    try {
        tokenIsValid = jwt.verify(token, process.env.SECRET_KEY || '');
    } catch (error) {
        tokenIsValid = null;
    }

    if (tokenIsValid) {
        const decoded = tokenIsValid as JwtPayload;

        const organizationAdmin = await OrganizationAdmin.findOne({
            where: { name: decoded.name, email: decoded.email, id: decoded.id },
            relations: ["roles", "roles.permissions"]
        });
        const volunteer = await Volunteer.findOne({
            where: { name: decoded.name, email: decoded.email, id: decoded.id },
            relations: ["roles", "roles.permissions", "volunteerProfile"]
        });

        if (organizationAdmin) {
            res.locals.organizationAdmin = organizationAdmin;
            res.cookie('name', res.locals.organizationAdmin.name, {
                httpOnly: true,
                maxAge: 60 * 24 * 60 * 1000,
                sameSite: "lax"       // Protect against CSRF attacks
            });
            next();
        } else if (volunteer) {
            res.locals.volunteer = volunteer;
            res.cookie('name', res.locals.volunteer.name, {
                httpOnly: true,
                maxAge: 60 * 24 * 60 * 1000,
                sameSite: "lax"       // Protect against CSRF attacks
            });
            next();
        } else {
            log({
                userId: "",
                userName: "",
                userType: "" as NSLogs.userType,
                type: 'failed' as NSLogs.Type,
                request: 'Authentication failed'
            }).then(() => {
                console.log('logged');
            }).catch(err => {
                console.log('NOT logged');
            })
            next(createError(401));
        }
    } else {
        log({
            userId: "",
            userName: "",
            userType: "" as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Authentication failed'
        }).then(() => {
            console.log('logged');
        }).catch(err => {
            console.log('NOT logged');
        })
        next(createError(401));
    }
}

export {
    authenticate
}
