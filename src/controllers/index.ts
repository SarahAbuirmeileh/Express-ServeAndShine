import express from 'express'
import { OrganizationAdmin } from '../db/entities/OrganizationAdmin.js';
import { Volunteer } from '../db/entities/Volunteer.js';

const getSender =async (res:express.Response)=>{
    let sender: OrganizationAdmin | Volunteer = new Volunteer();
    if (res.locals.organizationAdmin) {
        sender = await OrganizationAdmin.findOne({
            where: {
                name: res.locals.organizationAdmin.name, email: res.locals?.organizationAdmin.email
            }, relations: ["roles", "roles.permissions"]
        }) || new OrganizationAdmin();
    }else if(res.locals.volunteer){
        sender = await Volunteer.findOne({
            where: {
                name: res.locals.volunteer.name, email: res.locals?.volunteer.email
            }, relations: ["roles", "roles.permissions"]
        }) || new Volunteer();
    }
    return sender;
}

export {getSender};