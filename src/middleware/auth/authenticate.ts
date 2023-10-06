import express from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { OrganizationAdmin } from '../../db/entities/OrganizationAdmin.js';
import { Volunteer } from '../../db/entities/Volunteer.js';

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

    if (tokenIsValid ) {
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
            next();
        } else if (volunteer) {
            res.locals.volunteer = volunteer;
            next();
        } else {
            res.status(401).send("You are Unauthorized!");
        }
    } else {
        res.status(401).send("You are Unauthorized!");
    }
}

export {
    authenticate
}
