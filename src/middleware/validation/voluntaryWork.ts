import express from 'express';
import { NSVoluntaryWork } from '../../../types/voluntaryWork.js';
import { NSVolunteer } from '../../../types/volunteer.js';
import { getDate, isValidDate } from '../../controllers/index.js';
import { VoluntaryWork } from '../../db/entities/VoluntaryWork.js';
import createError from 'http-errors';

const validateVoluntaryWork = (req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    const values = ["name", "description", "location", "time", "status", "days", "startedDate", "finishedDate", "capacity", "skillTagIds"];
    const voluntaryWork = req.body;
    const errorList = values.map(key => !voluntaryWork[key] && `${key} is Required!`).filter(Boolean);

    const validStatus = Object.values(NSVoluntaryWork.StatusType).includes(voluntaryWork.status);
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
    if (getDate(voluntaryWork.startedDate) > getDate(voluntaryWork.finishedDate)) {
        errorList.push("The started date should be before the finished date !");
    }

    if (errorList.length > 0) {
        res.status(400).send(errorList);
    } else {
        next();
    }
}

const validateEditedVoluntaryWork = async (req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    const voluntaryWork = req.body;
    const errorList = [];

    const id = Number(req.params.id.toString());
    const vw = await VoluntaryWork.findOne({ where: { id } });
    if (!vw) {
        //res.status(400).send("Id not valid");
        next(createError(404));
    }

    if (voluntaryWork.status) {
        const validStatus = Object.values(NSVoluntaryWork.StatusType).includes(voluntaryWork.status);
        if (!validStatus) {
            errorList.push("Invalid status !");
        }
    }

    if (voluntaryWork.time) {
        const validTime = voluntaryWork.time.every((time: string) => Object.values(NSVolunteer.AvailableTime).includes(time as NSVolunteer.AvailableTime));
        if (!validTime) {
            errorList.push("Invalid time !");
        }
    }

    if (voluntaryWork.days) {
        const validDays = voluntaryWork.days.every((days: string) => Object.values(NSVolunteer.AvailableDays).includes(days as NSVolunteer.AvailableDays));
        if (!validDays) {
            errorList.push("Invalid days !");
        }
    }

    if (voluntaryWork.capacity) {
        if (voluntaryWork.capacity < 1 || voluntaryWork.capacity > 40) {
            errorList.push("Invalid capacity !");
        }
    }
    if (voluntaryWork.startedDate || voluntaryWork.finishedDate) {
        if (!isValidDate(voluntaryWork.startedDate) || !isValidDate(voluntaryWork.finishedDate)) {
            errorList.push("Invalid date !")
        }
    }
    if (voluntaryWork.startedDate && voluntaryWork.finishedDate) {
        if (getDate(voluntaryWork.startedDate) > getDate(voluntaryWork.finishedDate)) {
            errorList.push("The started date should be before the finished date !");
        }
    } else if (voluntaryWork.startedDate && vw) {
        if (getDate(voluntaryWork.startedDate) > vw.finishedDate) {
            errorList.push("The started date should be before the finished date !");
        }
    } else if (voluntaryWork.finishedDate && vw) {
        if (vw.startedDate > getDate(voluntaryWork.finishedDate)) {
            errorList.push("The started date should be before the finished date !");
        }
    }

    if (errorList.length) {
        res.status(400).send(errorList);
    } else {
        next();
    }
}

const validateVoluntaryWorkId = async (req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    const id = Number(req.params.id.toString());
    const p = await VoluntaryWork.findOne({ where: { id } });
    if (!p) {
        //res.status(400).send("Id not valid");
        next(createError(404));
    } else {
        next();
    }
}

export {
    validateVoluntaryWork,
    validateEditedVoluntaryWork,
    validateVoluntaryWorkId
}