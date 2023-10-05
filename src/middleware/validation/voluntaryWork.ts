import express from 'express';
import { NSVoluntaryWork } from '../../../types/voluntaryWork.js';
import { NSVolunteer } from '../../../types/volunteer.js';
import { getDate, isValidDate } from '../../controllers/index.js';

const validateVoluntaryWork = (req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    const values = ["name", "description", "location", "time", "status", "days", "startedDate", "finishedDate", "capacity", "skillTagIds"];
    const voluntaryWork = req.body;
    const errorList = values.map(key => !voluntaryWork[key] && `${key} is Required!`).filter(Boolean);

    const validStatus = voluntaryWork.status.every((status: string) => Object.values(NSVoluntaryWork.StatusType).includes(status as NSVoluntaryWork.StatusType));
    if (!validStatus) {
        errorList.push("Invalid status !");
    }

    const validTime = voluntaryWork.time.every((time: string) => Object.values(NSVolunteer.AvailableTime).includes(time as NSVolunteer.AvailableTime));
    if (!validTime) {
        errorList.push("Invalid time !");
    }

    const validDays = voluntaryWork.days.every((days: string) => Object.values(NSVolunteer.AvailableDays).includes(days as NSVolunteer.AvailableDays));
    if (!validDays) {
        errorList.push("Invalid days !");
    }
    
    if (voluntaryWork.capacity < 1 || voluntaryWork.capacity > 40) {
        errorList.push("Invalid capacity !");
    }
    if (!isValidDate(voluntaryWork.startedDate) || !isValidDate(voluntaryWork.finishedDate)) {
        errorList.push("Invalid date !")
    }
    if (getDate(voluntaryWork.startedDate) > getDate(voluntaryWork.finishedDate)){
        errorList.push("The started date should be before the finished date !");
    }

    if (errorList.length) {
        res.status(400).send(errorList);
    } else {
        next();
    }
}

export {
    validateVoluntaryWork
}