import { NSOrganizationProfile } from "../../types/organizationProfile.js";
import { OrganizationAdmin } from "../db/entities/OrganizationAdmin.js";
import { OrganizationProfile } from "../db/entities/OrganizationProfile.js";
import createError from 'http-errors';

const createOrganizationProfile = async (payload: NSOrganizationProfile.Item) => {
    const newOrganizationProfile = OrganizationProfile.create({ name: payload.name, description: payload.description });
    return newOrganizationProfile.save();
}

const editOrganizationProfile = async (payload: { id: string, name: string, description: string }) => {
    let profile = await OrganizationProfile.findOne({ where: { id: payload.id } });

    if (profile) {

        profile = Object.assign(profile, payload);
        return profile.save();
    } else {
        throw createError(404);
    }
}

const deleteOrganizationProfile = async (profileId: string) => {    
    return OrganizationProfile.delete(profileId);
}

const getOrganizationProfile = async (payload: {
    page: string,
    pageSize: string,
    id: string,
    name: string,
    adminName: string
}) => {

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
            throw createError(404);
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
}


export { createOrganizationProfile, editOrganizationProfile, deleteOrganizationProfile, getOrganizationProfile }