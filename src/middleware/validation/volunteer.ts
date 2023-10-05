import express from 'express';
import * as EmailValidator from 'email-validator';
import { isValidPassword } from '../../controllers/index.js';
import { NSVolunteer } from '../../../types/volunteer.js';


const validateVolunteer = (req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    const values = ["name", "email", "password", "type","availableTime","availableLocation", "PreferredActivities", "availableDays" ];
    const volunteer = req.body;
    const errorList = values.map(key => !volunteer[key] && `${key} is Required!`).filter(Boolean);

    if (!EmailValidator.validate(volunteer.email)) {
        errorList.push('Email is not Valid');
    }
    
    errorList.push(...isValidPassword(volunteer.password ));

    const validType= volunteer.type.every((status: string) => Object.values(NSVolunteer.TypeVolunteer).includes(status as NSVolunteer.TypeVolunteer));
    if (!validType) {
        errorList.push("Invalid status !");
    }

    const validTime = volunteer.time.every((time: string) => Object.values(NSVolunteer.AvailableTime).includes(time as NSVolunteer.AvailableTime));
    if (!validTime) {
        errorList.push("Invalid time !");
    }

    const validDays = volunteer.days.every((days: string) => Object.values(NSVolunteer.AvailableDays).includes(days as NSVolunteer.AvailableDays));
    if (!validDays) {
        errorList.push("Invalid days !");
    }

    if (errorList.length) {
        res.status(400).send(errorList);
    } else {
        next();
    }
}

export {
    validateVolunteer
}