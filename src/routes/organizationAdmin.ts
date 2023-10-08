import express from "express";
import { createOrganizationAdmin, deleteOrganizationAdmin, editOrganizationAdmin, getOrganizationAdmins } from "../controllers/organizationAdmin.js";
import { authorize, checkMe } from "../middleware/auth/authorize.js";
import { validateAdminEdited, validateAdminId, validateOrganizationAdmin } from "../middleware/validation/organizationAdmin.js";
import { log } from "../controllers/logs.js";

const router = express.Router();

router.post('/', authorize("POST_organizationAdmin"), validateOrganizationAdmin, (req, res, next) => {
    createOrganizationAdmin(req.body).then(() => {
        log({
            userId: res.locals.organizationAdmin.id,
            userName: res.locals.organizationAdmin.name,
            userType: 'admin',
            type: 'success',
            request: 'Create Organization Admin'
        }).then(() => {
            console.log('logged');
        }).catch(err => {
            console.log('NOT logged');
        })

        res.status(201).send("Organization Admin created successfully!!")
    }).catch(err => {
        log({
            userId: res.locals.organizationAdmin.id,
            userName: res.locals.organizationAdmin.name,
            userType: 'admin',
            type: 'failed',
            request: 'Create Organization Admin'
        }).then(() => {
            console.log('logged');
        }).catch(err => {
            console.log('NOT logged');
        })
        next(err);
    });
});

router.delete('/:id', validateAdminId, authorize("DELETE_organizationAdmin"), async (req, res, next) => {
    const id = req.params.id?.toString();

    deleteOrganizationAdmin(id)
        .then(data => {
            log({
                userId: res.locals.organizationAdmin.id,
                userName: res.locals.organizationAdmin.name,
                userType: 'admin',
                type: 'success',
                request: 'Delete Organization Admin'
            }).then(() => {
                console.log('logged');
            }).catch(err => {
                console.log('NOT logged');
            })
            res.send(data);
        })
        .catch(err => {
            log({
                userId: res.locals.organizationAdmin.id,
                userName: res.locals.organizationAdmin.name,
                userType: 'admin',
                type: 'failed',
                request: 'Delete Organization Admin'
            }).then(() => {
                console.log('logged');
            }).catch(err => {
                console.log('NOT logged');
            })
            next(err);
        });
});

router.put("/:id", authorize("PUT_organizationAdmin"), validateAdminEdited, async (req, res, next) => {
    editOrganizationAdmin({ ...req.body, id: req.params.id }).then(() => {
        log({
            userId: res.locals.organizationAdmin.id,
            userName: res.locals.organizationAdmin.name,
            userType: 'admin',
            type: 'success',
            request: 'Edit Organization Admin'
        }).then(() => {
            console.log('logged');
        }).catch(err => {
            console.log('NOT logged');
        })
        res.status(201).send("Organization Admin edited successfully!!")
    }).catch(err => {
        log({
            userId: res.locals.organizationAdmin.id,
            userName: res.locals.organizationAdmin.name,
            userType: 'admin',
            type: 'failed',
            request: 'Edit Organization Admin'
        }).then(() => {
            console.log('logged');
        }).catch(err => {
            console.log('NOT logged');
        })
        next(err);
    });
});

router.get('/', authorize("GET_organizationAdmins"), async (req, res, next) => {
    const payload = {
        page: req.query.page?.toString() || '1',
        pageSize: req.query.pageSize?.toString() || '10',
        id: req.query.id?.toString() || '',
        name: req.query.name?.toString() || '',
        email: req.query.email?.toString() || '',
        organizationName: req.query.organizationName?.toString() || ''
    };

    getOrganizationAdmins(payload)
        .then(data => {
            log({
                userId: res.locals.organizationAdmin.id,
                userName: res.locals.organizationAdmin.name,
                userType: 'admin',
                type: 'success',
                request: 'Get all Organization Admins'
            }).then(() => {
                console.log('logged');
            }).catch(err => {
                console.log('NOT logged');
            })
            res.send(data);
        })
        .catch(err => {
            log({
                userId: res.locals.organizationAdmin.id,
                userName: res.locals.organizationAdmin.name,
                userType: 'admin',
                type: 'failed',
                request: 'Get all Organization Admins'
            }).then(() => {
                console.log('logged');
            }).catch(err => {
                console.log('NOT logged');
            })
            next(err);
        });
});

export default router;