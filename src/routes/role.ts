import express from 'express';
import { createRole, deleteRole, editRole, getRoles } from '../controllers/role.js';
import { NSRole } from '../../types/role.js';
import { authorize } from '../middleware/auth/authorize.js';
import { validateEditedRole, validateRole, validateRoleId } from '../middleware/validation/role.js';
import { log } from '../controllers/dataBase-logger.js';
import { NSLogs } from '../../types/logs.js';

var router = express.Router();

router.post('/', authorize("POST_role"), validateRole, (req, res, next) => {
    createRole(req.body).then(() => {
        log({
            userId: res.locals.organizationAdmin?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: 'root' as NSLogs.userType,
            type: 'success' as NSLogs.Type,
            request: 'Create Role ' + req.body.name
        }).then(() => {
            console.log('logged');
        }).catch(err => {
            console.log('NOT logged');
        })
        res.status(201).send("Role created successfully!!")
    }).catch(err => {
        log({
            userId: res.locals.organizationAdmin?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: 'root' as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Create Role ' + req.body.name
        }).then(() => {
            console.log('logged');
        }).catch(err => {
            console.log('NOT logged');
        })
        next(err);
    });
});

router.delete('/:id', validateRoleId, authorize("DELETE_role"), async (req, res, next) => {
    const id = Number(req.params.id?.toString());

    deleteRole(id)
        .then(data => {
            log({
                userId: res.locals.organizationAdmin?.id,
                userName: res.locals.organizationAdmin?.name,
                userType: 'root' as NSLogs.userType,
                type: 'success' as NSLogs.Type,
                request: 'Delete Role with id: ' + id
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
                request: 'Delete Role with id: ' + id
            }).then(() => {
                console.log('logged');
            }).catch(err => {
                console.log('NOT logged');
            })
            next(err);
        });
})

router.put("/:id", authorize("PUT_role"), validateEditedRole, async (req, res, next) => {
    editRole({ ...req.body, id: req.params.id?.toString() }).then(() => {
        log({
            userId: res.locals.organizationAdmin?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: 'root' as NSLogs.userType,
            type: 'success' as NSLogs.Type,
            request: 'Edit Role with id: ' + req.params.id
        }).then(() => {
            console.log('logged');
        }).catch(err => {
            console.log('NOT logged');
        })
        res.status(201).send("Role edited successfully!!")
    }).catch(err => {
        log({
            userId: res.locals.organizationAdmin?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: 'root' as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Edit Role with id: ' + req.params.id
        }).then(() => {
            console.log('logged');
        }).catch(err => {
            console.log('NOT logged');
        })
        next(err);
    });
});

router.get('/', authorize("GET_roles"), async (req, res, next) => {
    const payload = {
        page: req.query.page?.toString() || '1',
        pageSize: req.query.pageSize?.toString() || '10',
        id: Number(req.query.id) || 0,
        name: req.query.name?.toString() as NSRole.Type
    };

    getRoles(payload)
        .then(data => {
            log({
                userId: res.locals.organizationAdmin?.id,
                userName: res.locals.organizationAdmin?.name,
                userType: 'root' as NSLogs.userType,
                type: 'success' as NSLogs.Type,
                request: 'Get Role/s'
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
                userType: 'root' as NSLogs.userType,
                type: 'failed' as NSLogs.Type,
                request: 'Get Role/s'
            }).then(() => {
                console.log('logged');
            }).catch(err => {
                console.log('NOT logged');
            })
            next(err);
        });
});

export default router;

