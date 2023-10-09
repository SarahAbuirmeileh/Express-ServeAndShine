import express from 'express';
import { createPermission, deletePermission, editPermission, getPermissions } from '../controllers/permission.js';
import { authorize } from '../middleware/auth/authorize.js';
import { validatePermission, validatePermissionId } from '../middleware/validation/permission.js';
import { log } from '../controllers/logs.js';
import { NSLogs } from '../../types/logs.js';

var router = express.Router();

router.post('/', authorize("POST_permissions"), validatePermission, (req, res, next) => {
    createPermission(req.body).then(() => {
        log({
            userId: res.locals.organizationAdmin?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: 'root' as NSLogs.userType,
            type: 'success' as NSLogs.Type,
            request: 'Create Permission'
        }).then(() => {
            console.log('logged');
        }).catch(err => {
            console.log('NOT logged');
        })
        res.status(201).send("Permission created successfully!!")
    }).catch(err => {
        log({
            userId: res.locals.organizationAdmin.id,
            userName: res.locals.organizationAdmin.name,
            userType: 'root' as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Create Permission'
        }).then(() => {
            console.log('logged');
        }).catch(err => {
            console.log('NOT logged');
        })
        next(err);
    });
});

router.delete('/:id', validatePermissionId, authorize("DELETE_permission"), async (req, res, next) => {
    const id = Number(req.params.id?.toString());

    deletePermission(id)
        .then(data => {
            log({
                userId: res.locals.organizationAdmin?.id,
                userName: res.locals.organizationAdmin?.name,
                userType: 'root' as NSLogs.userType,
                type: 'success' as NSLogs.Type,
                request: 'Delete Permission'
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
                userType: 'root' as NSLogs.userType,
                type: 'failed' as NSLogs.Type,
                request: 'Delete Permission'
            }).then(() => {
                console.log('logged');
            }).catch(err => {
                console.log('NOT logged');
            })
            next(err);
        });
})

router.put("/:id", authorize("PUT_permission"), validatePermissionId, async (req, res, next) => {
    editPermission({ ...req.body, id: req.params.id?.toString() }).then(() => {
        log({
            userId: res.locals.organizationAdmin?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: 'root' as NSLogs.userType,
            type: 'success' as NSLogs.Type,
            request: 'Edit Permission'
        }).then(() => {
            console.log('logged');
        }).catch(err => {
            console.log('NOT logged');
        })
        res.status(201).send("Permission edited successfully!!")
    }).catch(err => {
        log({
            userId: res.locals.organizationAdmin?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: 'root' as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Edit Permission'
        }).then(() => {
            console.log('logged');
        }).catch(err => {
            console.log('NOT logged');
        })
        next(err);
    });
});

router.get('/', authorize("GET_permissions"), async (req, res, next) => {
    const payload = {
        page: req.query.page?.toString() || '1',
        pageSize: req.query.pageSize?.toString() || '10',
        id: Number(req.query.id) || 0,
        name: req.query.name?.toString() || ""
    };

    getPermissions(payload)
        .then(data => {
            log({
                userId: res.locals.organizationAdmin?.id,
                userName: res.locals.organizationAdmin?.name,
                userType: 'root' as NSLogs.userType,
                type: 'success' as NSLogs.Type,
                request: 'Get Permissions'
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
                userType: 'root' as NSLogs.userType,
                type: 'failed' as NSLogs.Type,
                request: 'Get Permissions'
            }).then(() => {
                console.log('logged');
            }).catch(err => {
                console.log('NOT logged');
            })
            next(err);
        });
});

export default router;

