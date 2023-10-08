import { NSVolunteer } from "../../types/volunteer.js";
import dataSource from "../db/dataSource.js";
import { Volunteer } from "../db/entities/Volunteer.js";
import { VolunteerProfile } from "../db/entities/VolunteerProfile.js";
import { OrganizationAdmin } from "../db/entities/OrganizationAdmin.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { SkillTag } from "../db/entities/SkillTag.js";
import { In, Like } from "typeorm";
import createError from 'http-errors';
import { Role } from "../db/entities/Role.js";


const createVolunteer = async (payload: NSVolunteer.Item) => {

    return dataSource.manager.transaction(async (transaction) => {

        const existingSkillTags = await SkillTag.find({
            where: { name: In(payload.skills) },
        });

        const newSkillTags = await Promise.all(
            payload.skills.map(async (skillName) => {
                return existingSkillTags.find((tag) => tag.name === skillName) ||
                    (await transaction.save(SkillTag.create({ name: skillName })));
            })
        );

        const profile = VolunteerProfile.create({
            availableTime: payload.availableTime,
            availableLocation: payload.availableLocation,
            availableDays: payload.availableDays,
            skillTags: newSkillTags
        });
        await transaction.save(profile);

        const newVolunteer = Volunteer.create(payload);
        newVolunteer.volunteerProfile = profile;

        const role = await Role.findOne({where:{name:payload.type}});
        if (role){
            newVolunteer.roles = [role];
        }

        await transaction.save(newVolunteer);
    });
};

const deleteVolunteer = async (volunteerId: string) => {
    const volunteer = await Volunteer.findOne({
        where: { id: volunteerId },
    });

    if (volunteer) {
        return Volunteer.delete(volunteerId);
    } else {
        throw createError(404);
    }
}

const editVolunteer = async (payload: { name: string, id: string, email: string, oldPassword: string, newPassword: string }) => {
    const volunteer = await Volunteer.findOne({ where: { id: payload.id } });
   
    if (volunteer) {
        if (payload.name)
            volunteer.name = payload.name;

        if (payload.email)
            volunteer.email = payload.email;

        if (payload.newPassword) {
            if (!payload.oldPassword) {
                throw "Old password is needed !";
            }

            const passwordMatching = await bcrypt.compare(payload.oldPassword, volunteer?.password || '');
            if (passwordMatching) {
                volunteer.password = await bcrypt.hash(payload.newPassword, 10);
            } else {
                throw "The old password isn't correct !"
            }
        }

        return volunteer.save();

    } else {
        throw createError(404);
    }
}

const login = async (email: string, name: string, id: string) => {
    const volunteer = await Volunteer.findOne({
        where: { email, name, id },
        relations: ["roles", "roles.permissions"],
    });

    const organizationAdmin = await OrganizationAdmin.findOne({
        where: { email, name, id },
        relations: ["roles", "roles.permissions"],
    });

    if (volunteer) {
        const token = jwt.sign(
            { email, name, id },
            process.env.SECRET_KEY || '',
            {
                expiresIn: "1d"
            }
        );
        return token;
    } else if (organizationAdmin) {
        const token = jwt.sign(
            { email, name, id },
            process.env.SECRET_KEY || '',
            {
                expiresIn: "1d"
            }
        );        
        return token;
    } else {
        throw ("Invalid email or name or id !");
    }

}

const getVolunteers = async (payload: NSVolunteer.Item & { page: string; pageSize: string }) => {
    const page = parseInt(payload.page);
    const pageSize = parseInt(payload.pageSize);
    const conditions: Record<string, any> = {};
    
    if (payload.id) {
        conditions["id"] = payload.id;
    }
    if (payload.name) {
        conditions["name"] = Like(`%${payload.name}%`);
    }
    if (payload.email) {
        conditions["email"] = payload.email;
    }
    if (payload.availableTime.length > 0) {
        conditions["availableTime"] = In(payload.availableTime);
    }
    if (payload.availableLocation) {
        conditions["availableLocation"] = Like(`%${payload.availableLocation}%`);
    }
    if (payload.type) {        
        conditions["type"] = payload.type;
    }
    if (payload.availableDays.length > 0) {
        conditions["availableDays"] = In(payload.availableDays);
    }
    const [volunteers, total] = await Volunteer.findAndCount({
        where: conditions,
        order: {
            createdAt: 'ASC',
        },
        relations: [
            "volunteerProfile.skillTags",
            "volunteerProfile"
        ],
        select: [
            "name",
            "email",
            "type",
            "volunteerProfile"
        ],
    });

    const processedVolunteers = volunteers.map((volunteer) => {
        // Create a new volunteer object with the desired properties
        const processedVolunteer = {
            name: volunteer.name,
            email: volunteer.email,
            type: volunteer.type,
            createdAt: volunteer.createdAt,
            volunteerProfile: {
                availableTime: volunteer.volunteerProfile?.availableTime,
                availableDays: volunteer.volunteerProfile?.availableDays,
                availableLocation: volunteer.volunteerProfile?.availableLocation,
                dateOfBirth: volunteer.volunteerProfile?.dateOfBirth,
                roles:volunteer.volunteerProfile?.roles,
                skillTags: volunteer.volunteerProfile?.skillTags?.map((skillTag) => {
                    return { name: skillTag.name };
                }),
            },
        };

        return processedVolunteer;
    });

    const filteredVolunteers = processedVolunteers.filter((volunteer) => {
        if (payload.skills.length > 0) {
            const hasMatchingSkill = volunteer.volunteerProfile.skillTags.some((skillTag) => payload.skills.includes(skillTag.name));
            return hasMatchingSkill;
        }
        return true;
    });
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedVolunteers = filteredVolunteers.slice(startIndex, endIndex);

    return {
        page,
        pageSize: paginatedVolunteers.length,
        total: filteredVolunteers.length,
        volunteers: paginatedVolunteers,
    };
};

// "availableTime",
// "availableLocation",
// "availableDays",

export { getVolunteers, login, createVolunteer, deleteVolunteer, editVolunteer }

