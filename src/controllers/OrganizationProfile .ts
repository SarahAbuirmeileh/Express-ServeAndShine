import baseLogger from "../../logger.js";
import { NSOrganizationProfile } from "../../types/organizationProfile.js";
import { OrganizationAdmin } from "../db/entities/OrganizationAdmin.js";
import { OrganizationProfile } from "../db/entities/OrganizationProfile.js";
import createError from 'http-errors';

const error = { status: 500, message: 'when trying to manage organization profile' };

const createOrganizationProfile = async (payload: NSOrganizationProfile.Item) => {
    try {
        const newOrganizationProfile = OrganizationProfile.create({ name: payload.name, description: payload.description });
        return newOrganizationProfile.save();
    } catch (err) {
        baseLogger.error(err);
        throw createError(error.status, error.message);
    }
}

const editOrganizationProfile = async (payload: { id: string, name: string, description: string }) => {
    try {
        let profile = await OrganizationProfile.findOne({ where: { id: payload.id } });

        if (profile) {
            profile = Object.assign(profile, payload);
            return profile.save();
        }
    } catch (err) {
        baseLogger.error(err);
        throw createError(error.status, error.message);
    }
}

const deleteOrganizationProfile = async (profileId: string) => {
    try {
        return OrganizationProfile.delete(profileId);
    } catch (err) {
        baseLogger.error(err);
        throw createError(error.status, error.message);
    }
}

const searchOrganizationProfile = async (payload: {
    page: string,
    pageSize: string,
    id: string,
    name: string,
    adminName: string
}) => {
    try {

        if (payload.id) {
            const organization = await OrganizationProfile.findOne({ where: { id: payload.id } })

            if (organization) {
                return organization;
            } else {
                error.status = 404;
                error.message = "Organization";
                throw error;
            }
        }

        if (payload.name) {
            const organization = await OrganizationProfile.findOne({ where: { name: payload.name } })

            if (organization) {
                return organization;
            } else {
                error.status = 404;
                error.message = "Organization";
                throw error;
            }
        }

        if (payload.adminName) {
            const admin = await OrganizationAdmin.findOne({ where: { name: payload.adminName }, relations: ["orgProfile"] });

            if (admin) {
                return admin.orgProfile;
            } else {
                error.status = 404;
                error.message = "Organization";
                throw error;
            }
        }

    } catch (err) {
        baseLogger.error(err);
        throw createError(error.status, error.message);
    }
}

const getOrganizationProfile = async (payload: {
    page: string,
    pageSize: string
}) => {
    try {
        const page = parseInt(payload.page);
        const pageSize = parseInt(payload.pageSize);

        const [orgs, total] = await OrganizationProfile.findAndCount({
            skip: pageSize * (page - 1),
            take: pageSize,
            order: {
                createdAt: 'ASC'
            },
            select: ["name", "description", "createdAt"]
        })

        return {
            page,
            pageSize: orgs.length,
            total,
            orgs
        };
    } catch (err) {
        baseLogger.error(err);
        throw createError(error.status, error.message);
    }
}

export { getOrganizationProfile, createOrganizationProfile, editOrganizationProfile, deleteOrganizationProfile, searchOrganizationProfile }