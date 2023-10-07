import express from 'express';
import { Role } from '../../db/entities/Role.js';
import createError from 'http-errors';

const validateRole = (req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    const values = ['name', "permissionsId"];
    const role = req.body;
    const errorList = values.map(key => !role[key] && `${key} is Required!`).filter(Boolean);

    if (!['root', 'admin', 'volunteer', 'premium'].includes(role.name)) {
        errorList.push('role name unknown!');
    }

    if (errorList.length) {
        res.status(400).send(errorList);
    } else {
        next();
    }
}

const validateEditedRole = async (req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    const role = req.body;
    const errorList = [];

    const id = Number(req.params.id.toString());
    const r = await Role.findOne({ where: { id } });
    if (!r) {
        //res.status(400).send("Id not valid");
        next(createError(404));
    }

    if (role.name){
        if (!['root', 'admin', 'volunteer', 'premium'].includes(role.name)) {
            errorList.push('role name unknown!');
        }
    }

    if (errorList.length) {
        res.status(400).send(errorList);
    } else {
        next();
    }
}

export {
    validateRole,
    validateEditedRole
}