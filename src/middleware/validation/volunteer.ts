import express from 'express';
import * as EmailValidator from 'email-validator';
import { isValidPassword } from '../../controllers/index.js';
import { NSVolunteer } from '../../../types/volunteer.js';
import { Volunteer } from '../../db/entities/Volunteer.js';
import createError from 'http-errors'
import { NSLogs } from '../../../types/logs.js';
import { log } from '../../controllers/dataBaseLogger.js';


const validateVolunteer = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const volunteer = req.body;
    volunteer.type = "volunteer";
    const errorList: string[] = [];

    const requiredFields = ["name", "email", "password", "availableTime", "availableLocation", "availableDays", "skills"];
    requiredFields.forEach((field) => {
        if (!volunteer[field]) {
            errorList.push(`${field} is required.`);
        }
    });
    // const values = ["name", "email", "password", "availableTime", "availableLocation", "availableDays", "skills"];
    // const errorList = values.map(key => !volunteer[key] && `${key} is Required!`).filter(Boolean);

    if (!EmailValidator.validate(volunteer.email)) {
        errorList.push('Email is not valid.');
    }

    if (volunteer.type) {
        const validType = Object.values(NSVolunteer.TypeVolunteer).includes(volunteer.type);
        if (!validType) {
            errorList.push("Invalid type!");
        }
    }

    const validTime = volunteer.availableTime.every((time: string) => Object.values(NSVolunteer.AvailableTime).includes(time as NSVolunteer.AvailableTime));
    if (!validTime) {
        errorList.push("Invalid time!");
    }

    const validDays = volunteer.availableDays.every((days: string) => Object.values(NSVolunteer.AvailableDays).includes(days as NSVolunteer.AvailableDays));
    if (!validDays) {
        errorList.push("Invalid days!");
    }

    errorList.push(...isValidPassword(volunteer.password));

    if (errorList.length) {
        log({
            userId: res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
            userName: res.locals.organizationAdmin?.name || res.locals.volunteer?.name,
            userType: (res.locals.volunteer ? res.locals.volunteer?.type : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Bad Volunteer Request'
        }).then(() => {
            console.log('logged');
        }).catch(err => {
            console.log('NOT logged');
        })
        res.status(400).send({ errors: errorList });
    } else {
        next();
    }
};

const validateEditedVolunteer = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const volunteer = req.body;
    const errorList: string[] = [];

    const id = req.params.id.toString();
    const v = await Volunteer.findOne({ where: { id } });
    if (!v) {
        log({
            userId: res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
            userName: res.locals.organizationAdmin?.name || res.locals.volunteer?.name,
            userType: (res.locals.volunteer ? res.locals.volunteer?.type : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Invalid Volunteer id'
        }).then(() => {
            console.log('logged');
        }).catch(err => {
            console.log('NOT logged');
        })
        next(createError(404, "Volunteer"));
    }

    if (volunteer.email) {
        if (!EmailValidator.validate(volunteer.email)) {
            errorList.push('Email is not valid.');
        }
    }

    if (volunteer.type) {
        const validType = Object.values(NSVolunteer.TypeVolunteer).includes(volunteer.type);
        if (!validType) {
            errorList.push("Invalid type!");
        }
    }

    if (volunteer.availableTime) {
        const validTime = volunteer.availableTime.every((time: string) => Object.values(NSVolunteer.AvailableTime).includes(time as NSVolunteer.AvailableTime));
        if (!validTime) {
            errorList.push("Invalid time!");
        }
    }

    if (volunteer.availableDays) {
        const validDays = volunteer.availableDays.every((days: string) => Object.values(NSVolunteer.AvailableDays).includes(days as NSVolunteer.AvailableDays));
        if (!validDays) {
            errorList.push("Invalid days!");
        }
    }

    if (volunteer.password) {
        errorList.push(...isValidPassword(volunteer.password));
    }

    if (errorList.length) {
        log({
            userId: res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
            userName: res.locals.organizationAdmin?.name || res.locals.volunteer?.name,
            userType: (res.locals.volunteer ? res.locals.volunteer?.type : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Bad Volunteer Request'
        }).then(() => {
            console.log('logged');
        }).catch(err => {
            console.log('NOT logged');
        })
        res.status(400).send({ errors: errorList });
    } else {
        next();
    }
};

const validateVolunteerId = async (req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    const id = (req.params.id.toString());
    const p = await Volunteer.findOne({ where: { id } });
    if (!p) {
        log({
            userId: res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
            userName: res.locals.organizationAdmin?.name || res.locals.volunteer?.name,
            userType: (res.locals.volunteer ? res.locals.volunteer?.type : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Invalid Volunteer id'
        }).then(() => {
            console.log('logged');
        }).catch(err => {
            console.log('NOT logged');
        })
        next(createError(404, "Volunteer"));
    } else {
        next();
    }
}

export {
    validateVolunteer,
    validateEditedVolunteer,
    validateVolunteerId
}