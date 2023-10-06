import { NSOrganizationAdmin } from "../../types/organizationAdmin.js";
import { OrganizationAdmin } from "../db/entities/OrganizationAdmin.js";
import { OrganizationProfile } from "../db/entities/OrganizationProfile.js";
import bcrypt from 'bcrypt';
import { Volunteer } from "../db/entities/Volunteer.js";

const createOrganizationAdmin = async (payload: NSOrganizationAdmin.Item) => {

    const newOrganizationAdmin = OrganizationAdmin.create(payload);

    const organization = await OrganizationProfile.findOne({
        where: { id: payload.organizationId },
    });

    if (organization) {
        newOrganizationAdmin.orgProfile = organization;
        return newOrganizationAdmin.save();
    } else {
        throw "Organization not found :(";
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

    if (payload.id) {
        return OrganizationAdmin.findOne({ where: { id: payload.id } })
    }
    if (payload.name) {
        return OrganizationAdmin.findOne({ where: { name: payload.name } })
    }
    if (payload.email) {
        return OrganizationAdmin.findOne({ where: { email: payload.email } })
    }
    if (payload.organizationName) {
        const organization = await OrganizationProfile.findOne({ where: { name: payload.name } });
        if (organization) {

            return await OrganizationAdmin.findOne({ where: { orgProfile: { id: organization.id } } });
        } else {
            throw "Organization name not found :(";
        }
    }

    const [admins, total] = await OrganizationAdmin.findAndCount({
        skip: pageSize * (page - 1),
        take: pageSize,
        order: {
            createdAt: 'ASC'
        }
    })

    return {
        page,
        pageSize: admins.length,
        total,
        admins
    };
}

const deleteOrganizationAdmin = async (adminId: number) => {
    return OrganizationAdmin.delete(adminId);
}

const editOrganizationAdmin = async (payload: { id: string, name: string, email: string, password: string, organizationName: string }) => {

    const admin = await OrganizationAdmin.findOne({ where: { id: payload.id } });

    if (admin) {
        if (payload.name)
            admin.name = payload.name;

        if (payload.email)
            admin.email = payload.email;

        if (payload.password) {
            admin.password = await bcrypt.hash(payload.password, 10);

            if (payload.organizationName) {

                const profile = await OrganizationProfile.findOne({ where: { name: payload.organizationName } });
                if (profile) {
                    admin.orgProfile = profile;
                }
            }
            return admin.save();
        }

    } else {
        throw "Organization admin not found :(";
    }
}


export { createOrganizationAdmin, deleteOrganizationAdmin, editOrganizationAdmin, getOrganizationAdmins }