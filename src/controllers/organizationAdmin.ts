import { NSOrganizationAdmin } from "../../types/organizationAdmin.js";
import { OrganizationAdmin } from "../db/entities/OrganizationAdmin.js";
import { OrganizationProfile } from "../db/entities/OrganizationProfile.js";
import bcrypt from 'bcrypt';
import createError from 'http-errors';
import { Role } from "../db/entities/Role.js";
import { Not } from "typeorm";
import baseLogger from "../../logger.js";

const error = { status: 500, message: 'when trying to manade organization admin' };

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
            error.status = 404;
            error.message = "Organization";
            throw error
        }
    } catch (err) {
        baseLogger.error(err);
        throw createError(error.status, error.message);
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
            const admin = await OrganizationAdmin.findOne({
                where: { id: payload.id, name: Not("root") },
                select: ["name", "email", "createdAt"]
            })
            if (admin) {
                return admin;
            } else {
                error.status = 404;
                error.message = "Admin";
                throw error;
            }
        }
        if (payload.name) {
            const admin = await OrganizationAdmin.findOne({
                where: { name: payload.name === 'root' ? "" : payload.name },
                select: ["name", "email", "createdAt"]
            })
            if (admin) {
                return admin;
            } else {
                error.status = 404;
                error.message = "Admin";
                throw error;
            }
        }
        if (payload.email) {
            const admin = await OrganizationAdmin.findOne({
                where: { email: payload.email, name: Not("root") },
                select: ["name", "email", "createdAt"]
            })
            if (admin) {
                return admin;
            } else {
                error.status = 404;
                error.message = "Admin";
                throw error;
            }
        }
        if (payload.organizationName) {

            const organization = await OrganizationProfile.findOne({ where: { name: payload.organizationName } });
            if (organization) {
                const admin = await OrganizationAdmin.findOne({ where: { orgProfile: { id: organization.id } } });
                return { name: admin?.name, createdAt: admin?.createdAt, email: admin?.email };
            } else {
                error.status = 404;
                error.message = "Organization";
                throw error;
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
        throw createError(error.status, error.message);
    }
}

const deleteOrganizationAdmin = async (adminId: string) => {
    try {
        return OrganizationAdmin.delete(adminId);
    } catch (err) {
        baseLogger.error(err);
        error.status = 500;
        error.message = "when trying to delete the admin";
        throw createError(error.status, error.message);
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
                    error.status = 400;
                    error.message = "old password is required";
                    throw error;
                }

                const passwordMatching = await bcrypt.compare(payload.oldPassword, admin?.password || '');
                if (passwordMatching) {
                    admin.password = await bcrypt.hash(payload.newPassword, 10);
                } else {
                    error.status = 400;
                    error.message = "the old password isn't correct";
                    throw error;
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
            error.status = 404;
            error.message = "Organization";
            throw error;
        }
    } catch (err) {
        baseLogger.error(err)
        throw createError(error.status, error.message);
    }
}


export { createOrganizationAdmin, deleteOrganizationAdmin, editOrganizationAdmin, getOrganizationAdmins }