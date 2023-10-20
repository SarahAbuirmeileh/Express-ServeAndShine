import { DeepPartial, FindOperator, FindOptionsWhere, In, LessThan, LessThanOrEqual, Like, MoreThan, MoreThanOrEqual } from "typeorm";
import { NSVoluntaryWork } from "../../types/voluntaryWork.js";
import { SkillTag } from "../db/entities/SkillTag.js";
import { VoluntaryWork } from "../db/entities/VoluntaryWork.js";
import { getDate } from "./index.js";
import { Volunteer } from "../db/entities/Volunteer.js";
import createError from 'http-errors';
import baseLogger from "../../logger.js";
import { invokeLambdaFunction } from "./AWS-services/AWS-Lambda.js";

const createVoluntaryWork = async (payload: NSVoluntaryWork.Item) => {
    try {
        let payloadDate = { ...payload, startedDate: getDate(payload.startedDate), finishedDate: getDate(payload.finishedDate) };

        let newVoluntaryWork = VoluntaryWork.create(payloadDate as DeepPartial<VoluntaryWork>);
        const skillTags = await SkillTag.find({
            where: { id: In(payload.skillTagIds) },
        });
        newVoluntaryWork.skillTags = skillTags;
        newVoluntaryWork.feedback = [];
        newVoluntaryWork.images = [];
        return newVoluntaryWork.save();
    } catch (err) {
        baseLogger.error(err);
        throw ", when trying to create Voluntary work";
    }
}


const deleteVoluntaryWork = async (voluntaryWorkId: number) => {
    try {
        return VoluntaryWork.delete(voluntaryWorkId);
    } catch (err) {
        baseLogger.error(err);
        throw createError({ status: 404, message: "Voluntary work" });
    }
}

const editVoluntaryWork = async (payload: NSVoluntaryWork.Edit) => {
    try {

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
        }
    } catch (error) {
        baseLogger.error(error);
        throw createError({ status: 404, message: "Voluntary work" });
    }
}

const getVoluntaryWork = (payload: { id: number }) => {
    try {
        return VoluntaryWork.findOne({ where: { id: payload.id } })
    } catch (err) {
        baseLogger.error(err);
        throw createError({ status: 404, message: "Voluntary work" });
    }
}

const getVoluntaryWorks = async (payload: NSVoluntaryWork.GetVoluntaryWorks) => {
    try {

        const page = parseInt(payload.page);
        const pageSize = parseInt(payload.pageSize);
        const conditions: Record<string, any> = {};

        if (payload.id) {
            conditions["id"] = payload.id;
        }
        if (payload.name) {
            conditions["name"] = payload.name;
        }
        if (payload.time?.length > 0) {
            conditions["time"] = In(payload.time);
        }
        if (payload.location) {
            conditions["location"] = payload.location;
        }
        if (payload.rating) {
            conditions["rating"] = payload.rating;
        }
        if (payload.status) {
            conditions["status"] = payload.status;
        }
        if (payload.days?.length > 0) {
            conditions["days"] = In(payload.days);
        }
        if (payload.skills?.length > 0) {
            conditions["skillTags"] = In(payload.skills);
        }
        if (payload.startedDate) {
            conditions["startedDate"] = payload.startedDate; // Assuming this is a specific date comparison
        }
        if (payload.finishedDate) {
            conditions["finishedDate"] = payload.finishedDate; // Assuming this is a specific date comparison
        }
        if (payload.capacity) {
            conditions["capacity"] = payload.capacity;
        }
        if (payload.creatorId) {
            conditions["creatorId"] = payload.creatorId;
        }

        if (payload.startedAfter) {
            const startedAfterDate = getDate(payload.startedAfter);
            conditions["startedDate"] = MoreThan(payload.startedAfter);
        }

        if (payload.startedBefore) {
            const startedBeforeDate = getDate(payload.startedBefore);
            conditions["startedDate"] = LessThan(payload.startedBefore);
        }

        if (payload.finishedAfter) {
            const finishedAfterDate = getDate(payload.finishedAfter);
            conditions["finishedDate"] = MoreThan(payload.finishedAfter);
        }

        if (payload.finishedBefore) {
            const finishedBeforeDate = getDate(payload.finishedBefore);
            conditions["finishedDate"] = LessThan(payload.finishedBefore);
        }

        if (payload.ratingMore) {
            conditions["rating"] = MoreThanOrEqual(payload.ratingMore);
        }

        if (payload.ratingLess) {
            conditions["rating"] = LessThanOrEqual(payload.ratingLess);
        }

        const [voluntaryWorks, total] = await VoluntaryWork.findAndCount({
            where: conditions,
            skip: pageSize * (page - 1),
            take: pageSize,
            order: {
                createdAt: 'ASC'
            },
            relations: ['skillTags', 'volunteerProfiles']
        });
        const processedVW = await Promise.all(voluntaryWorks.map(async vw => {
            const volunteers = [];
            for (const vp of vw.volunteerProfiles) {
                const v = await Volunteer.findOne({ where: { volunteerProfile: { id: vp.id } } });
                if (v) {
                    volunteers.push({ name: v.name });
                }
            }
            return {
                name: vw.name,
                description: vw.description,
                days: vw.days,
                time: vw.time,
                location: vw.location,
                startedDate: vw.startedDate,
                finishedDate: vw.finishedDate,
                status: vw.status,
                images: vw.images,
                rating: vw.rating,
                feedback: vw.feedback,
                capacity: vw.capacity,
                skillTags: vw.skillTags.map(st => { return { name: st.name } }),
                volunteers,
                volunteerNumbers: volunteers.length,
                createdAt: vw.createdAt
            };
        }));


        return {
            page,
            pageSize: voluntaryWorks.length,
            total,
            voluntaryWorks: processedVW
        };
    } catch (err) {
        baseLogger.error(err);
        throw createError({ status: 404, message: "Voluntary work" });
    }
}

const putRating = async (id: number, rating: number) => {
    try {
        let voluntaryWork = await VoluntaryWork.findOne({ where: { id } });
        if (voluntaryWork) {
            if (voluntaryWork.rating) {
                voluntaryWork.rating += rating;
                voluntaryWork.rating /= 2;
            } else {
                voluntaryWork.rating = rating;
            }
            return voluntaryWork.save();
        }
    } catch (err) {
        baseLogger.error(err);
        throw createError(404,);
    }
}

const putFeedback = async (id: number, feedback: string) => {
    try {
        let voluntaryWork = await VoluntaryWork.findOne({ where: { id } });
        if (voluntaryWork) {
            voluntaryWork.feedback.push(feedback);
            await voluntaryWork.save();
        } else {
            throw createError({ status: 404, message: "Voluntary work" });
        }
    } catch (err) {
        baseLogger.error(err);
        throw ", when trying to add Feedback";
    }
}

const registerByVolunteer = async (workId: number, volunteerProfile: Volunteer["volunteerProfile"]) => {
    try {

        const voluntaryWork = await VoluntaryWork.findOne({ where: { id: workId } });
        if (!voluntaryWork) {
            throw createError({ status: 404, message: "Voluntary work" });
        }

        if (
            volunteerProfile.availableLocation !== voluntaryWork.location ||
            !(volunteerProfile.availableDays?.length > 0 && volunteerProfile.availableDays?.every(day => voluntaryWork.days.includes(day))) ||
            !(volunteerProfile.availableTime?.length > 0 && volunteerProfile.availableTime?.every(time => voluntaryWork.time.includes(time))) ||
            !(volunteerProfile.skillTags?.length > 0 && volunteerProfile.skillTags.every(skillTag => voluntaryWork.skillTags.some(workSkill => workSkill.id === skillTag.id)))
        ) {
            throw new Error("Volunteer's profile information does not align with the VoluntaryWork information");
        }

        if (voluntaryWork.volunteerProfiles?.length >= voluntaryWork.capacity) {
            throw new Error("VoluntaryWork is already at full capacity");
        }

        if (voluntaryWork.volunteerProfiles) {
            voluntaryWork.volunteerProfiles.push(volunteerProfile);
        } else {
            voluntaryWork.volunteerProfiles = [volunteerProfile];
        }

        await voluntaryWork.save();
        return "Registration successful!";
    } catch (err) {
        baseLogger.error(err);
        throw ", when trying to register by Volunteer";
    }
}

const registerByOrganizationAdmin = async (workId: number, volunteerId: string) => {
    try {

        const voluntaryWork = await VoluntaryWork.findOne({ where: { id: workId } });
        const volunteer = await Volunteer.findOne({
            where: { id: volunteerId },
            relations: ["roles", "roles.permissions", "volunteerProfile"]
        });

        if (!voluntaryWork) {
            throw "Voluntary work not found";
        }
        if (!volunteer) {
            throw "Volunteer not found";
        }

        if (voluntaryWork.volunteerProfiles) {
            voluntaryWork.volunteerProfiles.push(volunteer.volunteerProfile);
        } else {
            voluntaryWork.volunteerProfiles = [volunteer.volunteerProfile];
        }

        await voluntaryWork.save();
        return "Registration successful!";
    } catch (err) {
        baseLogger.error(err);
        throw ", when trying to register by organization admin";
    }
}


const deregisterVoluntaryWork = async (workId: number, volunteerId: string) => {
    try {

        const voluntaryWork = await VoluntaryWork.findOne({ where: { id: workId }, relations: ["volunteerProfiles"] });
        const volunteer = await Volunteer.findOne({ where: { id: volunteerId }, relations: ["volunteerProfile"] });

        if (!voluntaryWork) {
            throw createError({ status: 404, message: "Voluntary work" });
        }

        if (!volunteer) {
            throw createError({ status: 404, message: "Volunteer" });
        }
        const index = voluntaryWork.volunteerProfiles.findIndex(profile => profile.id === volunteer.volunteerProfile.id);
        if (index !== -1) {
            voluntaryWork.volunteerProfiles.splice(index, 1);
            await voluntaryWork.save();
            return "Deregistration successful!";
        } else {
            throw new Error("Volunteer is not registered for this voluntary work");
        }
    } catch (err) {
        baseLogger.error(err);
        throw ", when trying to deregister voluntary work";
    }
}

const generateCertificate = async (voluntaryWorkId: number,organizationName:string, date:string) => {
    const voluntaryWork = await VoluntaryWork.findOne({
        where: { id: voluntaryWorkId },
        relations: ["volunteerProfiles", "volunteerProfiles.volunteer"]
    });

    if (!voluntaryWork) {
        throw new Error(`Voluntary work with id ${voluntaryWorkId} not found.`);
    }

    const volunteerNames = voluntaryWork.volunteerProfiles.map(
        (volunteerProfile) => volunteerProfile.volunteer.name
    );

    const volunteerEmails = voluntaryWork.volunteerProfiles.map(
        (volunteerProfile) => volunteerProfile.volunteer.email
    );
    
    const payload = {
        volunteerName:volunteerNames[0], date, voluntaryWorkName:voluntaryWork.name, organizationName
    }
    const certificatePdf = invokeLambdaFunction("generateCertificate",payload);
}


export {
    deregisterVoluntaryWork, registerByOrganizationAdmin,
    registerByVolunteer, createVoluntaryWork,
    putFeedback, editVoluntaryWork, putRating, getVoluntaryWork,
    getVoluntaryWorks, deleteVoluntaryWork,
    generateCertificate
}