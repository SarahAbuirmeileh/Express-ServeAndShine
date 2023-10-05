import { DeepPartial, FindOperator, In } from "typeorm";
import { NSVoluntaryWork } from "../../types/voluntaryWork.js";
import { SkillTag } from "../db/entities/SkillTag.js";
import { VoluntaryWork } from "../db/entities/VoluntaryWork.js";
import { NSVolunteer } from "../../types/volunteer.js";
import { getDate } from "./index.js";

const createVoluntaryWork = async (payload: NSVoluntaryWork.Item) => {
    let payload2 = { ...payload, startedDate: getDate(payload.startedDate), finishedDate: getDate(payload.finishedDate) };

    let newVoluntaryWork = VoluntaryWork.create(payload2 as DeepPartial<VoluntaryWork>); 
    const skillTags = await SkillTag.find({
        where: { id: In(payload.skillTagIds) },
    });
    newVoluntaryWork.skillTags = skillTags;
    return newVoluntaryWork.save();
}


const deleteVoluntaryWork = async (voluntaryWorkId: number) => {
    return VoluntaryWork.delete(voluntaryWorkId);
}

const editVoluntaryWork = async (payload: NSVoluntaryWork.Edit) => {
    let voluntaryWork = await VoluntaryWork.findOne({ where: { id: payload.id } });
    if (voluntaryWork) {
        voluntaryWork = Object.assign(voluntaryWork, payload);
        return voluntaryWork?.save();

    } else {
        throw "VoluntaryWork not found :(";
    }
}

const getVoluntaryWork = (payload: { id: number }) => {
    return VoluntaryWork.findOne({ where: { id: payload.id } })
}

const getVoluntaryWorks = async (payload: {
    page: string,
    pageSize: string,
    id: number,
    name: string,
    time: NSVolunteer.AvailableTime[],
    location: string,
    days: NSVolunteer.AvailableDays[],
    rating: number,
    status: NSVoluntaryWork.StatusType,
    skills: string[],
    startedDate: string;
    finishedDate: string;
    capacity: number;
    finishedAfter: string;
    finishedBefore: string;
    startedAfter: string;
    startedBefore: string;
}) => {
    const page = parseInt(payload.page);
    const pageSize = parseInt(payload.pageSize);
    const conditions = [];

    if (payload.id) {
        return VoluntaryWork.findOne({ where: { id: payload.id } })
    }
    if (payload.name) {
        return VoluntaryWork.findOne({ where: { name: payload.name } })
    }
    if (payload.time.length > 0) {
        conditions.push({ time: In(payload.time) });
    }
    if (payload.location) {
        conditions.push({ location: payload.location });
    }
    if (payload.rating) {
        conditions.push({ rating: payload.rating });
    }
    if (payload.status) {
        conditions.push({ status: payload.status });
    }
    if (payload.days.length > 0) {
        conditions.push({ days: In(payload.days) });
    }
    if (payload.skills.length > 0) {
        conditions.push({ skillTags: { name: In(payload.skills) } });
    }
    // if (payload.startedDate) {
    //     conditions.push({ startedDate: payload.startedDate }); 
    // }
    // if (payload.finishedDate) {
    //     conditions.push({ finishedDate: payload.finishedDate }); 
    // }
    if (payload.capacity) {
        conditions.push({ capacity: payload.capacity });
    }
    if (payload.finishedDate) {
        conditions.push({ finishedDate: payload.finishedDate });
    }
    if (payload.startedDate) {
        conditions.push({ startedDate: payload.startedDate });
    }

    const [voluntaryWorks, total] = await VoluntaryWork.findAndCount({
        //where: conditions.length > 0 ? conditions : {},
        skip: pageSize * (page - 1),
        take: pageSize,
        order: {
            createdAt: 'ASC'
        },
        relations: ['skillTags'] // Include the skillTags relationship
    });

    return {
        page,
        pageSize: voluntaryWorks.length,
        total,
        voluntaryWorks
    };
}


export { createVoluntaryWork, editVoluntaryWork, getVoluntaryWork, getVoluntaryWorks, deleteVoluntaryWork }