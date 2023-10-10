import express from "express";
import { createOrganizationAdmin, deleteOrganizationAdmin, editOrganizationAdmin, getOrganizationAdmins } from "../controllers/organizationAdmin.js";
import { authorize, checkMe } from "../middleware/auth/authorize.js";
import { validateAdminEdited, validateAdminId, validateOrganizationAdmin } from "../middleware/validation/organizationAdmin.js";
import { log } from "../controllers/dataBase-logger.js";
import { NSLogs } from "../../types/logs.js";

const router = express.Router();

router.post('/', authorize("POST_organizationAdmin"), validateOrganizationAdmin, (req, res, next) => {
    createOrganizationAdmin(req.body).then((data) => {
        log({
            userId: res.locals.organizationAdmin?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: 'root' as NSLogs.userType,
            type: 'success' as NSLogs.Type,
            request: 'Create Organization Admin '+ data.name
        }).then(() => {
            console.log('logged');
        }).catch(err => {
            console.log('NOT logged');
        })

        res.status(201).send("Organization Admin created successfully!!")
    }).catch(err => {
        log({
            userId: res.locals.organizationAdmin?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: 'root' as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Create Organization Admin ' + req.body.name
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
                userId: res.locals.organizationAdmin?.id,
                userName: res.locals.organizationAdmin?.name,
                userType: (res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
                type: 'success' as NSLogs.Type,
                request: 'Delete Organization Admin with id: '+ id
            }).then(() => {
                console.log('logged');
            }).catch(err => {
                console.log('NOT logged');
            })
            res.send(data);
        })
        .catch(err => {
            log({
                userId: res.locals.organizationAdmin?.id,
                userName: res.locals.organizationAdmin?.name,
                userType: (res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
                type: 'failed' as NSLogs.Type,
                request: 'Delete Organization Admin with id: '+ id
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
            userId: res.locals.organizationAdmin?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: (res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'success' as NSLogs.Type,
            request: 'Edit Organization Admin with id: '+ req.params.id 
        }).then(() => {
            console.log('logged');
        }).catch(err => {
            console.log('NOT logged');
        })
        res.status(201).send("Organization Admin edited successfully!!")
    }).catch(err => {
        log({
            userId: res.locals.organizationAdmin?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: (res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Edit Organization Admin with id: '+ req.params.id 
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
                userId: res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
                userName: res.locals.organizationAdmin?.name || res.locals.volunteer?.name,
                userType: (res.locals.volunteer?.type ? res.locals.volunteer?.type  : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
                type: 'success' as NSLogs.Type,
                request: 'Get Organization Admin/s'
            }).then(() => {
                console.log('logged');
            }).catch(err => {
                console.log('NOT logged');
            })
            res.send(data);
        })
        .catch(err => {
            log({
                userId: res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
                userName: res.locals.organizationAdmin?.name || res.locals.volunteer?.name,
                userType: (res.locals.volunteer?.type ? res.locals.volunteer?.type  : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
                type: 'failed' as NSLogs.Type,
                request: 'Get Organization Admin/s'
            }).then(() => {
                console.log('logged');
            }).catch(err => {
                console.log('NOT logged');
            })
            next(err);
        });
});

export default router;