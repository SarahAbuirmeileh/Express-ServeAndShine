import { DeepPartial, FindOperator, FindOptionsWhere, In, LessThan, LessThanOrEqual, MoreThan, MoreThanOrEqual } from "typeorm";
import { NSVoluntaryWork } from "../../types/voluntaryWork.js";
import { SkillTag } from "../db/entities/SkillTag.js";
import { VoluntaryWork } from "../db/entities/VoluntaryWork.js";
import { getDate } from "./index.js";
import { Volunteer } from "../db/entities/Volunteer.js";
import { VolunteerProfile } from "../db/entities/VolunteerProfile.js";
import createError from 'http-errors';

const createVoluntaryWork = async (payload: NSVoluntaryWork.Item) => {
    let payloadDate = { ...payload, startedDate: getDate(payload.startedDate), finishedDate: getDate(payload.finishedDate) };

    let newVoluntaryWork = VoluntaryWork.create(payloadDate as DeepPartial<VoluntaryWork>);
    const skillTags = await SkillTag.find({
        where: { id: In(payload.skillTagIds) },
    });
    newVoluntaryWork.skillTags = skillTags;
    newVoluntaryWork.feedback = [];
    newVoluntaryWork.images = [];
    return newVoluntaryWork.save();
}


const deleteVoluntaryWork = async (voluntaryWorkId: number) => {
    return VoluntaryWork.delete(voluntaryWorkId);
}

const editVoluntaryWork = async (payload: NSVoluntaryWork.Edit) => {
    const id = Number(payload.id) || 0;
    let voluntaryWork = await VoluntaryWork.findOne({ where: { id } });

    if (voluntaryWork) {
        voluntaryWork.name = payload.name || voluntaryWork.name;
        voluntaryWork.description = payload.description || voluntaryWork.description;
        voluntaryWork.location = payload.location || voluntaryWork.location;
        voluntaryWork.capacity = payload.capacity || voluntaryWork.capacity;
        voluntaryWork.days = payload.days || voluntaryWork.days;
        voluntaryWork.images = payload.images || voluntaryWork.images;
        voluntaryWork.time = payload.time || voluntaryWork.time;
        voluntaryWork.status = payload.status || voluntaryWork.status;

        if (payload.skillTagIds) {
            const skillTags = await SkillTag.find({
                where: { id: In(payload.skillTagIds) },
            });
            voluntaryWork.skillTags = skillTags;
        }
        if (payload.startedDate) {
            voluntaryWork.startedDate = getDate(payload.startedDate);
        }
        if (payload.finishedDate) {
            voluntaryWork.finishedDate = getDate(payload.finishedDate);
        }

        return voluntaryWork.save();
    } else {
        throw createError(404);
    }
}

const getVoluntaryWork = (payload: { id: number }) => {
    return VoluntaryWork.findOne({ where: { id: payload.id } })
}

const getVoluntaryWorks = async (payload: NSVoluntaryWork.GetVoluntaryWorks) => {
    const page = parseInt(payload.page);
    const pageSize = parseInt(payload.pageSize);
    const conditions = [];

    if (payload.id) {
        const voluntaryWork = await VoluntaryWork.findOne({ where: { id: payload.id }, relations: ['skillTags', 'volunteerProfiles'] })
        return {
            ...voluntaryWork,
            volunteerNumbers: voluntaryWork?.volunteerProfiles.length
        }


    }
    if (payload.name) {
        const voluntaryWork = await VoluntaryWork.findOne({ where: { name: payload.name }, relations: ['skillTags', 'volunteerProfiles'] })
        return {
            ...voluntaryWork,
            volunteerNumbers: voluntaryWork?.volunteerProfiles.length
        }
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
    if (payload.startedDate) {
        let startedDate = getDate(payload.startedDate);
        conditions.push({ startedDate: startedDate });
    }
    if (payload.finishedDate) {
        let finishedDate = getDate(payload.finishedDate);
        conditions.push({ finishedDate: finishedDate });
    }
    if (payload.capacity) {
        conditions.push({ capacity: payload.capacity });
    }
    if (payload.creatorId) {
        conditions.push({ creatorId: payload.creatorId });
    }

    if (payload.startedAfter) {
        const startedAfterDate = getDate(payload.startedAfter);
        conditions.push({ startedDate: MoreThan(startedAfterDate) });
    }

    if (payload.startedBefore) {
        const startedBeforeDate = getDate(payload.startedBefore);
        conditions.push({ startedDate: LessThan(startedBeforeDate) });
    }

    if (payload.finishedAfter) {
        const finishedAfterDate = getDate(payload.finishedAfter);
        conditions.push({ finishedDate: MoreThan(finishedAfterDate) });
    }

    if (payload.finishedBefore) {
        const finishedBeforeDate = getDate(payload.finishedBefore);
        conditions.push({ finishedDate: LessThan(finishedBeforeDate) });
    }

    if (payload.ratingMore) {
        conditions.push({ rating: MoreThanOrEqual(payload.ratingMore) });
    }

    if (payload.ratingLess) {
        conditions.push({ rating: LessThanOrEqual(payload.ratingLess) });
    }

    const [voluntaryWorks, total] = await VoluntaryWork.findAndCount({
        where: conditions.length > 0 ? conditions : {},
        skip: pageSize * (page - 1),
        take: pageSize,
        order: {
            createdAt: 'ASC'
        },
        relations: ['skillTags', 'volunteerProfiles']
    });

    return {
        page,
        pageSize: voluntaryWorks.length,
        total,
        voluntaryWorks: voluntaryWorks.map(voluntaryWork => ({
            ...voluntaryWork,
            volunteerNumbers: voluntaryWork.volunteerProfiles.length,
        }))
    };
}

const putRating = async (id: number, rating: number) => {
    let voluntaryWork = await VoluntaryWork.findOne({ where: { id } });
    if (voluntaryWork) {
        voluntaryWork.rating += rating;
        voluntaryWork.rating /= 2;
        return voluntaryWork.save();
    } else {
        throw createError(404);
    }
}

const putFeedback = async (id: number, feedback: string) => {
    let voluntaryWork = await VoluntaryWork.findOne({ where: { id } });
    if (voluntaryWork) {
        voluntaryWork.feedback.push(feedback);
        await voluntaryWork.save();
    } else {
        throw createError(404);
    }
}

const putImages = async (id: number, images: string[]) => {
    let voluntaryWork = await VoluntaryWork.findOne({ where: { id } });
    if (voluntaryWork) {
        voluntaryWork.images.push(...images);
        await voluntaryWork.save();
    } else {
        throw createError(404);
    }
}

const registerByVolunteer = async (workId: number, volunteerProfile: Volunteer["volunteerProfile"]) => {
    const voluntaryWork = await VoluntaryWork.findOne({ where: { id: workId } });
    if (!voluntaryWork) {
        throw createError(404);
    }

    if (
        volunteerProfile.availableLocation !== voluntaryWork.location ||
        !volunteerProfile.availableDays.every(day => voluntaryWork.days.includes(day)) ||
        !volunteerProfile.availableTime.every(time => voluntaryWork.time.includes(time)) ||
        !volunteerProfile.skillTags.every(skillTag => voluntaryWork.skillTags.some(workSkill => workSkill.id === skillTag.id))
    ) {
        throw new Error("Volunteer's profile information does not align with the VoluntaryWork information");
    }

    if (voluntaryWork.volunteerProfiles.length >= voluntaryWork.capacity) {
        throw new Error("VoluntaryWork is already at full capacity");
    }

    voluntaryWork.volunteerProfiles.push(volunteerProfile);
    await voluntaryWork.save();

    return "Registration successful!";
}

const registerByOrganizationAdmin = async (workId: number, volunteerId: string) => {
    const voluntaryWork = await VoluntaryWork.findOne({ where: { id: workId } });
    const volunteer = await Volunteer.findOne({ where: { id: volunteerId } });

    if (!voluntaryWork) {
        throw createError(404);
    }
    if (!volunteer) {
        throw createError(404);
    }

    voluntaryWork.volunteerProfiles.push(volunteer.volunteerProfile);
    await voluntaryWork.save();

    return "Registration successful!";
}

const deregisterVoluntaryWork = async (workId: number, volunteerId: string) => {
    const voluntaryWork = await VoluntaryWork.findOne({ where: { id: workId }, relations: ["volunteerProfiles"] });
    const volunteer = await Volunteer.findOne({ where: { id: volunteerId } });

    if (!voluntaryWork) {
        throw createError(404);
    }

    if (!volunteer) {
        throw createError(404);
    }

    const index = voluntaryWork.volunteerProfiles.findIndex(profile => profile.id === volunteer.volunteerProfile.id);

    if (index !== -1) {
        voluntaryWork.volunteerProfiles.splice(index, 1);
        await voluntaryWork.save();
        return "Deregistration successful!";
    } else {
        throw new Error("Volunteer is not registered for this voluntary work");
    }
}


export {
    deregisterVoluntaryWork, registerByOrganizationAdmin,
    registerByVolunteer, putImages, createVoluntaryWork,
    putFeedback, editVoluntaryWork, putRating, getVoluntaryWork,
    getVoluntaryWorks, deleteVoluntaryWork
}