import express from 'express'
import { OrganizationAdmin } from '../db/entities/OrganizationAdmin.js';
import { Volunteer } from '../db/entities/Volunteer.js';
import { NSVoluntaryWork } from '../../types/voluntaryWork.js';

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

const getDate = (date:string): Date | Date=>{
    let [year, month, day] =date.split('-').map( (str) =>{return parseInt(str, 10);});
    return new Date(year,month,day,0,0,0,0);
}

export {getSender, getDate};