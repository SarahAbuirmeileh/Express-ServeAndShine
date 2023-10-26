import express from 'express';
import { createRole, deleteRole, editRole, getRoles } from '../controllers/role.js';
import { NSRole } from '../../types/role.js';
import { authorize } from '../middleware/auth/authorize.js';
import { validateEditedRole, validateRole, validateRoleId } from '../middleware/validation/role.js';
import { log } from '../controllers/dataBaseLogger.js';
import { NSLogs } from '../../types/logs.js';
import { logToCloudWatch } from '../controllers/AWSServices/CloudWatchLogs.js';

var router = express.Router();

router.post('/', authorize("POST_role"), validateRole, (req, res, next) => {
    createRole(req.body).then((data) => {
        log({
            userId: res.locals.organizationAdmin?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: 'root' as NSLogs.userType,
            type: 'success' as NSLogs.Type,
            request: 'Create Role ' + req.body.name
        }).then().catch()

        logToCloudWatch(
            'success',
            'role',
            'Create Role ' + req.body.name,
            res.locals.organizationAdmin?.id,
            res.locals.organizationAdmin?.name
        ).then().catch()

        res.status(201).send({message:"Role created successfully!!",data})
    }).catch(err => {
        log({
            userId: res.locals.organizationAdmin?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: 'root' as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Create Role ' + req.body.name
        }).then().catch()

        logToCloudWatch(
            'failed',
            'role',
            'Create Role ' + req.body.name,
            res.locals.organizationAdmin?.id,
            res.locals.organizationAdmin?.name
        ).then().catch()

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
            }).then().catch()

            logToCloudWatch(
                'success',
                'role',
                'Delete Role with id: ' + id,
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
                request: 'Delete Role with id: ' + id
            }).then().catch()

            logToCloudWatch(
                'failed',
                'role',
                'Delete Role with id: ' + id,
                res.locals.organizationAdmin?.id,
                res.locals.organizationAdmin?.name
            ).then().catch()

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
        }).then().catch()

        logToCloudWatch(
            'success',
            'role',
            'Edit Role with id: ' + req.params.id,
            res.locals.organizationAdmin?.id,
            res.locals.organizationAdmin?.name
        ).then().catch()

        res.status(200).send("Role edited successfully!!")
    }).catch(err => {
        log({
            userId: res.locals.organizationAdmin?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: 'root' as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Edit Role with id: ' + req.params.id
        }).then().catch()

        logToCloudWatch(
            'failed',
            'role',
            'Edit Role with id: ' + req.params.id,
            res.locals.organizationAdmin?.id,
            res.locals.organizationAdmin?.name
        ).then().catch()

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
            }).then().catch()

            logToCloudWatch(
                'success',
                'role',
                'Get Role/s',
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
                request: 'Get Role/s'
            }).then().catch()

            logToCloudWatch(
                'failed',
                'role',
                'Get Role/s',
                res.locals.organizationAdmin?.id,
                res.locals.organizationAdmin?.name,
            ).then().catch()

            next(err);
        });
});

export default router;

/**
 * @swagger
 * tags:
 *   name: Role
 *   description: The permission managing API
 */

/**
 * @swagger
 * /role:
 *   post:
 *     summary: Create a new role with associated permissions
 *     tags: [Role]
 *     requestBody:
 *       description: Role data to create
 *       required: true
 *       content:
 *         application/json:  
 *           example:
 *             name: "Role Name"
 *             permissionsId: [1, 2] 
 *     responses:
 *       201:
 *         description: Role created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               example:
 *                 message: "Role created successfully"
 *                 data:
 *                   id: 1
 *                   name: "Role Name"
 *                   permissions: [
 *                     {
 *                       id: 1,
 *                       name: "Permission 1"
 *                     },
 *                     {
 *                       id: 2,
 *                       name: "Permission 2"
 *                     }
 *                   ]
 *       400:
 *         description: Bad request, validation failed
 */

/**
 * @swagger
 * /role/{id}:
 *   delete:
 *     summary: Delete a role by ID
 *     tags: [Role]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the role to delete
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *       404:
 *         description: Role not found
 */

/**
 * @swagger
 * /role/{id}:
 *   put:
 *     summary: Edit a role by ID
 *     tags: [Role]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the role to edit
 *     requestBody:
 *       description: Role data to update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *           example:
 *             name: "Updated Role Name"
 *     responses:
 *       200:
 *         description: Role edited successfully
 *       404:
 *         description: Role not found
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Get roles based on the provided query parameters or get all roles
 *     tags: [Role]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *         description: Page number for pagination
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: string
 *         description: Number of items per page
 *       - in: query
 *         name: id
 *         schema:
 *           type: number
 *         description: Filter roles by ID
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter roles by name
 *     responses:
 *       200:
 *         description: List of roles or a single role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                 pageSize:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 roles:
 *                   type: array
 *                   items:
 *                     type: object
 *               example:
 *                 page: 1
 *                 pageSize: 10
 *                 total: 2
 *                 roles:
 *                   - id: 1
 *                     name: "Role 1"
 *                   - id: 2
 *                     name: "Role 2"
 *       404:
 *         description: Role not found
 */
