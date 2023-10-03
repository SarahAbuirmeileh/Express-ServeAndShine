import { FindOperator, In } from "typeorm";
import { NSVoluntaryWork } from "../../types/voluntaryWork.js";
import { SkillTag } from "../db/entities/SkillTag.js";
import { VoluntaryWork } from "../db/entities/VoluntaryWork.js";
import { NSVolunteer } from "../../types/volunteer.js";

const createVoluntaryWork = async (payload: NSVoluntaryWork.Item) => {
    try {
        const newVoluntaryWork = VoluntaryWork.create(payload);
        const skillTags = await SkillTag.find({
            where: { id: In(payload.skillTagIds) },
        });
        newVoluntaryWork.skillTags = skillTags;
        return newVoluntaryWork.save();
    }
    catch (error) {
        console.log(error);
    }
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
    skills: string[]
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
    if (payload.time.length>0) {
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
    if (payload.days.length>0) {
        conditions.push({ days: In(payload.days) });
    }
    if (payload.skills.length>0) {
        conditions.push({ skillTags: { name: In(payload.skills) } });
    }

    const query = {
        where: conditions.length > 0 ? conditions : {},
    };

    const [voluntaryWorks, total] = await VoluntaryWork.findAndCount({
        where: conditions.length > 0 ? conditions : {},
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