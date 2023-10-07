import express from 'express';
import { OrganizationProfile } from '../../db/entities/OrganizationProfile.js';

const validateOrganizationProfile = (req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    const values = ["name", "description"];
    const organizationProfile = req.body;
    const errorList = values.map(key => !organizationProfile[key] && `${key} is Required!`).filter(Boolean);
    
    if (errorList.length) {
        res.status(400).send(errorList);
    } else {
        next();
    }
}

const validateOrgId = async (req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    const id = req.params.id.toString();
    const v = await OrganizationProfile.findOne({ where: { id } });
    if (!v) {
        res.status(400).send("Id not valid");
    }else{
        next();
    }
}

export {
    validateOrganizationProfile,
    validateOrgId
}