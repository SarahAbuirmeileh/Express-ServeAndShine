import { NSOrganizationProfile } from "../../types/organizationProfile.js";
import { OrganizationAdmin } from "../db/entities/OrganizationAdmin.js";
import { OrganizationProfile } from "../db/entities/OrganizationProfile.js";

const creatOrganizationProfile = async (payload: NSOrganizationProfile.Item) => {

    const newOrganizationProfile = OrganizationProfile.create(payload);
    return newOrganizationProfile.save();
}

const editOrganizationProfile = async (payload: { id: string, name: string, description: string }) => {
    let profile = await OrganizationProfile.findOne({ where: { id: payload.id } });

    if (profile) {

        profile = Object.assign(profile, payload);
        return profile.save();
    } else {
        throw "Organization profile not found :(";
    }
}

const deleteOrganizationProfile = async (profileId: number) => {
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

    // //get OrganizationProfile by organizationAdmin  

    // if (payload.adminName) {
    //     const admin = await OrganizationAdmin.findOne({ where: { name: payload.name } });

    //     if (admin) {

    //         return await OrganizationProfile.findOne({ where: { orgProfile: { id: admin.id } } });
    //     } else {
    //         throw "Admin name not found :(";
    //     }

    // }

    const [orgs, total] = await OrganizationProfile.findAndCount({
        skip: pageSize * (page - 1),
        take: pageSize,
        order: {
            createdAt: 'ASC'
        }
    })

    return {
        page,
        pageSize: orgs.length,
        total,
        orgs
    };
}


export { creatOrganizationProfile, editOrganizationProfile, deleteOrganizationProfile, getOrganizationProfile }