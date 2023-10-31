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
import baseLogger from "../../logger.js";
import { sendEmail } from "./AWSServices/SES.js";

const error = { status: 500, message: 'when trying to manage volunteer' };

const createVolunteer = async (payload: NSVolunteer.Item) => {
    try {

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

            const role = await Role.findOne({ where: { name: payload.type } });
            if (role) {
                newVolunteer.roles = [role];
            }

            await transaction.save(newVolunteer);
            profile.volunteer = newVolunteer;
            await transaction.save(profile);
            return newVolunteer
        });
    } catch (err) {
        baseLogger.error(err);
        throw createError(error.status, error.message);
    }
};

const deleteVolunteer = async (volunteerId: string) => {
    try {
        return Volunteer.delete(volunteerId);
    } catch (err) {
        baseLogger.error(err);
        throw createError({ status: 404, message: "Volunteer" });
    }
}

const editVolunteer = async (payload: { name: string, id: string, email: string }) => {
    try {
        const volunteer = await Volunteer.findOne({ where: { id: payload.id } });
        if (volunteer) {
            if (payload.name)
                volunteer.name = payload.name;

            if (payload.email)
                volunteer.email = payload.email;

            return volunteer.save();
        }
    } catch (err) {
        baseLogger.error(err);
        throw createError(error.status, error.message);
    }
}

const login = async (email: string, name: string, id: string) => {
    try {
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
            return { token, volunteer, organizationAdmin: null };
        } else if (organizationAdmin) {
            const token = jwt.sign(
                { email, name, id },
                process.env.SECRET_KEY || '',
                {
                    expiresIn: "1d"
                }
            );
            return { token, organizationAdmin, volunteer: null };
        } else {
            error.status = 400;
            error.message = 'Invalid email or name or id !';
            throw error;
        }
    } catch (err) {
        baseLogger.error(err);
        throw createError(error.status, error.message);
    }

}

const getVolunteers = async (payload: NSVolunteer.Item & { page: string; pageSize: string }) => {
    try {
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
        if (payload.availableLocation) {
            conditions["volunteerProfile"] = { availableLocation: Like(`%${payload.availableLocation}%`) };
        }
        if (payload.type) {
            conditions["type"] = payload.type;
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
            return {
                name: volunteer.name,
                email: volunteer.email,
                type: volunteer.type,
                createdAt: volunteer.createdAt,
                volunteerProfile: {
                    availableTime: volunteer.volunteerProfile?.availableTime,
                    availableDays: volunteer.volunteerProfile?.availableDays,
                    availableLocation: volunteer.volunteerProfile?.availableLocation,
                    dateOfBirth: volunteer.volunteerProfile?.dateOfBirth,
                    roles: volunteer.roles,
                    skillTags: volunteer.volunteerProfile?.skillTags?.map((skillTag) => {
                        return { name: skillTag.name };
                    }),
                },
            };
        });

        const filteredVolunteers = processedVolunteers.filter((volunteer) => {
            if (payload.skills.length > 0) {
                const hasMatchingSkill = volunteer.volunteerProfile.skillTags.some((skillTag) => payload.skills.includes(skillTag.name));
                return hasMatchingSkill;
            }
            return true;
        });

        const finalFilteredVolunteers = filteredVolunteers.filter((volunteer) => {
            if (payload.availableTime && payload.availableTime.length > 0) {
                if (!volunteer.volunteerProfile || !volunteer.volunteerProfile.availableTime) {
                    return false;
                }
                return payload.availableTime.every(time => volunteer.volunteerProfile.availableTime.includes(time));
            }

            if (payload.availableDays && payload.availableDays.length > 0) {
                if (!volunteer.volunteerProfile || !volunteer.volunteerProfile.availableDays) {
                    return false;
                }
                return payload.availableDays.every(day => volunteer.volunteerProfile.availableDays.includes(day));
            }

            return true;
        });

        if (finalFilteredVolunteers.length == 0) {
            error.status = 404;
            error.message = "Volunteer";
            throw error;
        }

        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedVolunteers = finalFilteredVolunteers.slice(startIndex, endIndex);

        return {
            page,
            pageSize: paginatedVolunteers.length,
            total: finalFilteredVolunteers.length,
            volunteers: paginatedVolunteers,
        };
    } catch (err) {
        baseLogger.error(err);
        throw createError(error.status, error.message);
    }
}

const forgetPassword = async (id: string, email: string) => {
    const volunteer = await Volunteer.findOne({ where: { id, email } });
    if (!volunteer) throw "Volunteer Not exists"

    const secret = process.env.SECRET_KEY + volunteer.password;
    const payload = { email, id }

    const token = jwt.sign(payload, secret, { expiresIn: '15m' });

    const link = `http://localhost:3000/volunteer/reset-password/${id}/${token}`
    return sendEmail(email, volunteer.name, "Reset the password", `Use this one time link ${link}`)

}

const verifyToken = async (id: string, token: string) => {
    const volunteer = await Volunteer.findOne({ where: { id } });
    if (!volunteer) {
        throw "Volunteer not found";
    }

    const secret = process.env.SECRET_KEY + volunteer.password;

    try {
        const payload = jwt.verify(token, secret);
    } catch (err) {
        baseLogger.error(err);
        throw "Invalid or expired token";
    }
}

const resetPassword = async (id: string, token: string, password: string) => {
    try {
        await verifyToken(id, token);
        const volunteer = await Volunteer.findOne({ where: { id } });
        if (volunteer) {
            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                volunteer.password = hashedPassword;
                await volunteer.save();
                return "Password updated successfully!!"
            }
        }
    } catch (err) {
        baseLogger.error(err);
        throw err;
    }
}

export { resetPassword, verifyToken, forgetPassword, getVolunteers, login, createVolunteer, deleteVolunteer, editVolunteer }

