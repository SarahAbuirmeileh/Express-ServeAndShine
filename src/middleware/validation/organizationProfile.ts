import express from 'express';

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

export {
    validateOrganizationProfile 
}