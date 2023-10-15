import { NSOrganizationAdmin } from "../../types/organizationAdmin.js";
import { OrganizationAdmin } from "../db/entities/OrganizationAdmin.js";
import { OrganizationProfile } from "../db/entities/OrganizationProfile.js";
import bcrypt from 'bcrypt';
import createError from 'http-errors';
import { Role } from "../db/entities/Role.js";
import { Not } from "typeorm";
import baseLogger from "../../logger.js";

const createOrganizationAdmin = async (payload: NSOrganizationAdmin.Item) => {
    try {
        const newOrganizationAdmin = OrganizationAdmin.create(payload);
        const organization = await OrganizationProfile.findOne({
            where: { id: payload.organizationId },
        });

        const role = await Role.findOne({ where: { name: "admin" } });
        if (role) {
            newOrganizationAdmin.roles = role;
        }

        if (organization) {
            newOrganizationAdmin.orgProfile = organization;
            return newOrganizationAdmin.save();
        } else {
            throw createError({status: 404, message: "Organization"});
        }
    } catch (err) {
        baseLogger.error(err);
        throw ", when trying to create Organization admin";
    }
}

const getOrganizationAdmins = async (payload: {
    page: string,
    pageSize: string,
    id: string,
    name: string,
    email: string,
    organizationName: string
}) => {
    const page = parseInt(payload.page);
    const pageSize = parseInt(payload.pageSize);

    try {
        if (payload.id) {
            return OrganizationAdmin.findOne({
                where: { id: payload.id, name: Not("root") },
                select: ["name", "email", "createdAt"]
            })
        }
        if (payload.name) {
            return OrganizationAdmin.findOne({
                where: { name: payload.name === 'root' ? "" : payload.name },
                select: ["name", "email", "createdAt"]
            })
        }
        if (payload.email) {
            return OrganizationAdmin.findOne({
                where: { email: payload.email, name: Not("root") },
                select: ["name", "email", "createdAt"]
            })
        }
        if (payload.organizationName) {

            const organization = await OrganizationProfile.findOne({ where: { name: payload.organizationName } });
            if (organization) {
                const admin = await OrganizationAdmin.findOne({ where: { orgProfile: { id: organization.id } } });
                return { name: admin?.name, createdAt: admin?.createdAt, email: admin?.email };
            } else {
                throw createError({status: 404, message: "Organization"});
            }
        }

        const [admins, total] = await OrganizationAdmin.findAndCount({
            skip: pageSize * (page - 1),
            take: pageSize,
            order: {
                createdAt: 'ASC'
            },
            where: {
                name: Not("root")
            },
            select: ["name", "email", "createdAt"]
        })

        return {
            page,
            pageSize: admins.length,
            total,
            admins
        };
    } catch (err) {
        baseLogger.error(err)
        throw createError({status: 404, message: "Organization admin"});
    }
}

const deleteOrganizationAdmin = async (adminId: string) => {
    try {
        return OrganizationAdmin.delete(adminId);
    } catch (err) {
        baseLogger.error(err);
        throw createError({status: 404, message: "Organization admin"});
    }
}

const editOrganizationAdmin = async (payload: { id: string, name: string, email: string, newPassword: string, oldPassword: string, organizationName: string }) => {
    try {
        const admin = await OrganizationAdmin.findOne({ where: { id: payload.id } });
        if (admin) {
            if (payload.name)
                admin.name = payload.name;

            if (payload.email)
                admin.email = payload.email;

            if (payload.newPassword) {
                if (!payload.oldPassword) {
                    throw "Old password is needed !";
                }

                const passwordMatching = await bcrypt.compare(payload.oldPassword, admin?.password || '');
                if (passwordMatching) {
                    admin.password = await bcrypt.hash(payload.newPassword, 10);
                } else {
                    throw "The old password isn't correct !"
                }
            }
            if (payload.organizationName) {

                const profile = await OrganizationProfile.findOne({ where: { name: payload.organizationName } });
                if (profile) {
                    admin.orgProfile = profile;
                }
            }
            return admin.save();


        } else {
            throw createError({status: 404, message: "Organization admin"});
        }
    } catch (err) {
        baseLogger.error(err)
        throw createError(404);
    }
}


export { createOrganizationAdmin, deleteOrganizationAdmin, editOrganizationAdmin, getOrganizationAdmins }