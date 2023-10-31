import { NSOrganizationAdmin } from "../../types/organizationAdmin.js";
import { OrganizationAdmin } from "../db/entities/OrganizationAdmin.js";
import { OrganizationProfile } from "../db/entities/OrganizationProfile.js";
import bcrypt from 'bcrypt';
import createError from 'http-errors';
import { Role } from "../db/entities/Role.js";
import { Not } from "typeorm";
import baseLogger from "../../logger.js";
import { sendEmail } from "./AWSServices/SES.js";
import jwt from 'jsonwebtoken';

const error = { status: 500, message: 'when trying to manage organization admin' };

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
            throw error;
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

const editOrganizationAdmin = async (payload: { id: string, name: string, email: string, organizationName: string }) => {
    try {
        const admin = await OrganizationAdmin.findOne({ where: { id: payload.id } });
        if (admin) {
            if (payload.name)
                admin.name = payload.name;

            if (payload.email)
                admin.email = payload.email;

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

const forgetPassword = async (id: string, email: string) => {
    const organizationAdmin = await OrganizationAdmin.findOne({ where: { id, email } });
    if (!organizationAdmin) throw "OrganizationAdmin Not exists"

    const secret = process.env.SECRET_KEY + organizationAdmin.password;
    const payload = { email, id }

    const token = jwt.sign(payload, secret, { expiresIn: '15m' });

    const link = `http://localhost:3000/organizationAdmin/reset-password/${id}/${token}`
    return sendEmail(email, organizationAdmin.name, "Reset the password", `Use this one time link ${link}`)
}

const verifyToken = async (id: string, token: string) => {
    const organizationAdmin = await OrganizationAdmin.findOne({ where: { id } });
    if (!organizationAdmin) {
        throw "OrganizationAdmin not found";
    }

    const secret = process.env.SECRET_KEY + organizationAdmin.password;

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
        const organizationAdmin = await OrganizationAdmin.findOne({ where: { id } });
        if (organizationAdmin) {
            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                organizationAdmin.password = hashedPassword;
                await organizationAdmin.save();
                return "Password updated successfully!!"
            }
        }
    } catch (err) {
        baseLogger.error(err);
        throw err;
    }
}

export { forgetPassword, resetPassword, verifyToken, createOrganizationAdmin, deleteOrganizationAdmin, editOrganizationAdmin, getOrganizationAdmins }