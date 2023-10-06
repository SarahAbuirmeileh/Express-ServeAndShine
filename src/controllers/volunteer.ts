import { NSVolunteer } from "../../types/volunteer.js";
import dataSource from "../db/dataSource.js";
import { Volunteer } from "../db/entities/Volunteer.js";
import { VolunteerProfile } from "../db/entities/VolunteerProfile.js";
import { OrganizationAdmin } from "../db/entities/OrganizationAdmin.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { SkillTag } from "../db/entities/SkillTag.js";
import { In } from "typeorm";


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
        await transaction.save(newVolunteer);
    });
};

const deleteVolunteer = async (volunteerId: number) => {
    return Volunteer.delete(volunteerId);
}

const editVolunteer = async (payload: { name: string, id: string, email: string, password: string }) => {
    const volunteer = await Volunteer.findOne({ where: { id: payload.id } });
    if (volunteer) {
        if (payload.name)
            volunteer.name = payload.name;

        if (payload.email)
            volunteer.email = payload.email;

        if (payload.password)
            volunteer.password = await bcrypt.hash(payload.password, 10);

        return volunteer.save();

    } else {
        throw "Volunteer not found :(";
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
                expiresIn: "15m"
            }
        );
        return token;
    } else if (organizationAdmin) {
        const token = jwt.sign(
            { email, name, id },
            process.env.SECRET_KEY || '',
            {
                expiresIn: "15m"
            }
        );
        return token;
    } else {
        throw ("Invalid email or name or id !");
    }

}

export { login, createVolunteer, deleteVolunteer, editVolunteer }

