import express from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { OrganizationAdmin } from '../../db/entities/OrganizationAdmin.js';
import { Volunteer } from '../../db/entities/Volunteer.js';
import createError from 'http-errors';

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
            relations: ["roles", "roles.permissions"]
        });

        if (organizationAdmin) {
            res.locals.organizationAdmin = organizationAdmin;
            res.cookie('name', res.locals.organizationAdmin.name, {
                httpOnly: true,
                maxAge: 15 * 60 * 1000,
                sameSite: "lax"       // Protect against CSRF attacks
            });
            next();
        } else if (volunteer) {
            res.locals.volunteer = volunteer;
            res.cookie('name', res.locals.volunteer.name, {
                httpOnly: true,
                maxAge: 15 * 60 * 1000,
                sameSite: "lax"       // Protect against CSRF attacks
            });
            next();
        } else {
            //res.status(401).send("You are Unauthorized!");
            next(createError(401));
        }
    } else {
        //res.status(401).send("You are Unauthorized!");
        next(createError(401));
    }
}

export {
    authenticate
}
