import baseLogger from "../../logger.js";
import { NSOrganizationProfile } from "../../types/organizationProfile.js";
import { OrganizationAdmin } from "../db/entities/OrganizationAdmin.js";
import { OrganizationProfile } from "../db/entities/OrganizationProfile.js";
import createError from 'http-errors';

const createOrganizationProfile = async (payload: NSOrganizationProfile.Item) => {
    try {
        const newOrganizationProfile = OrganizationProfile.create({ name: payload.name, description: payload.description });
        return newOrganizationProfile.save();
    } catch (err) {
        baseLogger.error(err);
        throw createError(404,);
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
        throw createError(404);
    }
}

const deleteOrganizationProfile = async (profileId: string) => {
    try {
        return OrganizationProfile.delete(profileId);
    } catch (err) {
        baseLogger.error(err);
        throw createError(404);
    }
}

const getOrganizationProfile = async (payload: {
    page: string,
    pageSize: string,
    id: string,
    name: string,
    adminName: string
}) => {
    try {
        const page = parseInt(payload.page);
        const pageSize = parseInt(payload.pageSize);

        if (payload.id) {
            return OrganizationProfile.findOne({ where: { id: payload.id } })
        }

        if (payload.name) {
            return OrganizationProfile.findOne({ where: { name: payload.name } })
        }

        if (payload.adminName) {
            const admin = await OrganizationAdmin.findOne({ where: { name: payload.adminName } });

            if (admin) {
                return admin;
            } else {
                throw "Admin not found"
            }
        }

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
        throw createError(404);
    }
}


export { createOrganizationProfile, editOrganizationProfile, deleteOrganizationProfile, getOrganizationProfile }