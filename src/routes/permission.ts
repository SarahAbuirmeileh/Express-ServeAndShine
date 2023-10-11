import express from 'express';
import { createPermission, deletePermission, editPermission, getPermissions } from '../controllers/permission.js';
import { authorize } from '../middleware/auth/authorize.js';
import { validatePermission, validatePermissionId } from '../middleware/validation/permission.js';
import { log } from '../controllers/dataBase-logger.js';
import { NSLogs } from '../../types/logs.js';
import { logToCloudWatch } from '../controllers/cloudWatch-logger.js';

var router = express.Router();

router.post('/', authorize("POST_permission"), validatePermission, (req, res, next) => {
    createPermission(req.body).then((data) => {

        log({
            userId: res.locals.organizationAdmin?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: 'root' as NSLogs.userType,
            type: 'success' as NSLogs.Type,
            request: 'Create Permission ' + req.body.name
        }).then().catch()

        logToCloudWatch(
            'success',
            'permission',
            'Create Permission ' + req.body.name,
            res.locals.organizationAdmin?.id,
            res.locals.organizationAdmin?.name
        ).then().catch()

        res.status(201).send("Permission created successfully!!")
    }).catch(err => {
        log({
            userId: res.locals.organizationAdmin?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: 'root' as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Create Permission ' + req.body.name
        }).then().catch()

        logToCloudWatch(
            'failed',
            'permission',
            'Create Permission ' + req.body.name,
            res.locals.organizationAdmin?.id,
            res.locals.organizationAdmin?.name
        ).then().catch()

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
                request: 'Delete Permission with id: ' + id
            }).then().catch()

            logToCloudWatch(
                'success',
                'permission',
                'Delete Permission with id: ' + id,
                res.locals.organizationAdmin?.id,
                res.locals.organizationAdmin?.name,
            ).then().catch()

            res.send(data);
        })
        .catch(err => {
            log({
                userId: res.locals.organizationAdmin?.id,
                userName: res.locals.organizationAdmin?.name,
                userType: 'root' as NSLogs.userType,
                type: 'failed' as NSLogs.Type,
                request: 'Delete Permission with id: ' + id
            }).then().catch()

            logToCloudWatch(
                'failed',
                'permission',
                'Delete Permission with id: ' + id,
                res.locals.organizationAdmin?.id,
                res.locals.organizationAdmin?.name,
            ).then().catch()

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
            request: 'Edit Permission with id: ' + req.params.id
        }).then().catch()

        logToCloudWatch(
            'success',
            'permission',
            'Edit Permission with id: ' + req.params.id,
            res.locals.organizationAdmin?.id,
            res.locals.organizationAdmin?.name
        ).then().catch()

        res.status(201).send("Permission edited successfully!!")
    }).catch(err => {
        log({
            userId: res.locals.organizationAdmin?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: 'root' as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Edit Permission with id: ' + req.params.id
        }).then().catch()

        logToCloudWatch(
            'failed',
            'permission',
            'Edit Permission with id: ' + req.params.id,
            res.locals.organizationAdmin?.id,
            res.locals.organizationAdmin?.name
        ).then().catch()

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
                request: 'Get Permission/s'
            }).then().catch()

            logToCloudWatch(
                'success',
                'permission',
                'Get Permission/s',
                res.locals.organizationAdmin?.id,
                res.locals.organizationAdmin?.name
            ).then().catch()

            res.send(data);
        })
        .catch(err => {
            log({
                userId: res.locals.organizationAdmin?.id,
                userName: res.locals.organizationAdmin?.name,
                userType: 'root' as NSLogs.userType,
                type: 'failed' as NSLogs.Type,
                request: 'Get Permission/s'
            }).then().catch()

            logToCloudWatch(
                'failed',
                'permission',
                'Get Permission/s',
                res.locals.organizationAdmin?.id,
                res.locals.organizationAdmin?.name
            ).then().catch()

            next(err);
        });
});

export default router;

