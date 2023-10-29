import express from "express";
import { createOrganizationAdmin, deleteOrganizationAdmin, editOrganizationAdmin, getOrganizationAdmins } from "../controllers/organizationAdmin.js";
import { authorize, checkMe } from "../middleware/auth/authorize.js";
import { validateAdminEdited, validateAdminId, validateOrganizationAdmin } from "../middleware/validation/organizationAdmin.js";
import { log } from "../controllers/dataBaseLogger.js";
import { NSLogs } from "../../types/logs.js";
import { logToCloudWatch } from "../controllers/AWSServices/CloudWatchLogs.js";
import { login } from "../controllers/volunteer.js";
import { authenticate } from "../middleware/auth/authenticate.js";
import { validateLogin } from "../middleware/validation/volunteer.js";

const router = express.Router();

router.post('/signup', /*authorize("POST_organizationAdmin"), */validateOrganizationAdmin, (req, res, next) => {
    createOrganizationAdmin(req.body).then(async (data) => {
        log({
            userId: data.id,
            userName: req.body.name,
            userType: 'root' as NSLogs.userType,
            type: 'success' as NSLogs.Type,
            request: 'Create Organization Admin ' + data.name
        }).then().catch()

        logToCloudWatch(
            'success',
            'organization admin',
            'Create Organization Admin ' + data.name,
            data.id,
            req.body.name
        ).then().catch()
        const { password, ...dataWithoutPassword } = data;
        res.status(201).send({ message: "Organization Admin created successfully!!", dataWithoutPassword })
    }).catch(async err => {
        log({
            userId: "",
            userName: req.body.name,
            userType: 'root' as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Create Organization Admin ' + req.body.name
        }).then().catch()

        logToCloudWatch(
            'failed',
            'organization admin',
            'Create Organization Admin ' + req.body.name,
            "",
            req.body.name
        ).then().catch()

        next(err);
    });
});

router.post('/login',validateLogin, (req, res, next) => {
    const email = req.body.email;
    const name = req.body.name;
    const id = req.body.id;    
    login(email, name, id)
        .then(data => {
            res.cookie('myApp', data.token, {
                httpOnly: true,
                maxAge: 60 * 24 * 60 * 1000,
                sameSite: "lax"       // Protect against CSRF attacks
            });

            log({
                userId: id,
                userName: name,
                userType: (data.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
                type: 'success' as NSLogs.Type,
                request: 'Login ' + (name)
            }).then().catch()

            logToCloudWatch(
                'success',
                'organization admin',
                'Login ' + (name),
                id,
                name
            ).then().catch()

            res.status(200).send("You logged in successfully !");
        })
        .catch(err => {
            log({
                userId: id,
                userName: name,
                userType: 'volunteer' as NSLogs.userType,
                type: 'failed' as NSLogs.Type,
                request: 'Login ' + (name)
            }).then().catch()

            logToCloudWatch(
                'failed',
                'organization admin',
                'Login ' + name,
                id,
                name
            ).then().catch()

            res.status(401).send(err);
        })
});

router.delete('/:id',/*authenticate, */validateAdminId, /*authorize("DELETE_organizationAdmin"), */async (req, res, next) => {
    const id = req.params.id?.toString();

    deleteOrganizationAdmin(id)
        .then(async data => {
            log({
                userId: res.locals.organizationAdmin?.id,
                userName: res.locals.organizationAdmin?.name,
                userType: (res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
                type: 'success' as NSLogs.Type,
                request: 'Delete Organization Admin with id: ' + id
            }).then().catch()

            logToCloudWatch(
                'success',
                'organization admin',
                'Delete Organization Admin with id: ' + id,
                res.locals.organizationAdmin?.id,
                res.locals.organizationAdmin?.name
            ).then().catch()

            res.send(data);
        })
        .catch(async err => {
            log({
                userId: res.locals.organizationAdmin?.id,
                userName: res.locals.organizationAdmin?.name,
                userType: (res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
                type: 'failed' as NSLogs.Type,
                request: 'Delete Organization Admin with id: ' + id
            }).then().catch()

            logToCloudWatch(
                'failed',
                'organization admin',
                'Delete Organization Admin with id: ' + id,
                res.locals.organizationAdmin?.id,
                res.locals.organizationAdmin?.name
            ).then().catch()

            next(err);
        });
});

router.put("/:id",/*authenticate, authorize("PUT_organizationAdmin"),*/ validateAdminEdited, async (req, res, next) => {
    editOrganizationAdmin({ ...req.body, id: req.params.id }).then(async () => {
        log({
            userId: res.locals.organizationAdmin?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: (res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'success' as NSLogs.Type,
            request: 'Edit Organization Admin with id: ' + req.params.id
        }).then().catch()

        logToCloudWatch(
            'success',
            'organization admin',
            'Edit Organization Admin with id: ' + req.params.id,
            res.locals.organizationAdmin?.id,
            res.locals.organizationAdmin?.name
        ).then().catch()

        res.status(200).send("Organization Admin edited successfully!!")
    }).catch(async err => {
        log({
            userId: res.locals.organizationAdmin?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: (res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Edit Organization Admin with id: ' + req.params.id
        })

        logToCloudWatch(
            'failed',
            'organization admin',
            'Edit Organization Admin with id: ' + req.params.id,
            res.locals.organizationAdmin?.id,
            res.locals.organizationAdmin?.name
        ).then().catch()

        next(err);
    });
});

router.get('/search',/*authenticate, authorize("GET_organizationAdmins"),*/ async (req, res, next) => {
    const payload = {
        page: req.query.page?.toString() || '1',
        pageSize: req.query.pageSize?.toString() || '10',
        id: req.query.id?.toString() || '',
        name: req.query.name?.toString() || '',
        email: req.query.email?.toString() || '',
        organizationName: req.query.organizationName?.toString() || ''
    };

    getOrganizationAdmins(payload)
        .then(async data => {
            log({
                userId: res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
                userName: res.locals.organizationAdmin?.name || res.locals.volunteer?.name,
                userType: (res.locals.volunteer?.type ? res.locals.volunteer?.type : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
                type: 'success' as NSLogs.Type,
                request: 'Get Organization Admin/s'
            }).then().catch()

            logToCloudWatch(
                'success',
                'organization admin',
                'Get Organization Admin/s',
                res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
                res.locals.organizationAdmin?.name || res.locals.volunteer?.name
            ).then().catch()

            res.send(data);
        })
        .catch(async err => {
            log({
                userId: res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
                userName: res.locals.organizationAdmin?.name || res.locals.volunteer?.name,
                userType: (res.locals.volunteer?.type ? res.locals.volunteer?.type : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
                type: 'failed' as NSLogs.Type,
                request: 'Get Organization Admin/s'
            }).then().catch()

            logToCloudWatch(
                'failed',
                'organization admin',
                'Get Organization Admin/s',
                res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
                res.locals.organizationAdmin?.name || res.locals.volunteer?.name
            ).then().catch()

            next(err);
        });
});



/**
 * @swagger
 * tags:
 *   name: OrganizationAdmin
 *   description: The OrganizationAdmin managing API
 */


/**
 * @swagger
 * /organizationAdmin/login:
 *   post:
 *     summary: Login an organization admin
 *     tags: [OrganizationAdmin]
 *     requestBody:
 *       description: Organization admin data to sign up
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               id:
 *                 type: string
 *           example:
 *             name: "Admin 1"
 *             email: "tamimitarteel@gmail.com"
 *             id: "89588e2a-7f6e-42cc-b3d2-943e04966eb6"
 *     responses:
 *       200:
 *         description: Organization admin loged in successfully
 *       401:
 *         description: Organization admin unauthorized
 */

/**
 * @swagger
 * /organizationAdmin/search:
 *   get:
 *     summary: Get organization admin based on the provided query parameters
 *     tags: [OrganizationAdmin]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         description: Filter organization admin by ID
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter organization admin by name
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filter organization admin by email
 *       - in: query
 *         name: organizationName
 *         schema:
 *           type: string
 *         description: Filter organization admin by organization name
 *     responses:
 *       200:
 *         description: Find organization admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 organizationAdmin:
 *                   type: object
 *               example:
 *                 organizationProfile:
 *                   - name: "Admin 1"
 *                     email: "tamimitarteel@gamil.com"
 *                     createdAt: "22023-10-26T22:26:29.365Z"
 *                     
 *       404:
 *         description: Organization Admin not found
 */

/**
 * @swagger
 * /organizationAdmin/{id}:
 *   delete:
 *     summary: Delete an organization admin by ID
 *     tags: [OrganizationAdmin]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the organization admin to delete
 *     responses:
 *       200:
 *         description: Organization admin deleted successfully
 *       404:
 *         description: Organization admin not found
 */

/**
 * @swagger
 * /organizationAdmin/signup:
 *   post:
 *     summary: Sign up an organization admin
 *     tags: [OrganizationAdmin]
 *     requestBody:
 *       description: Organization admin data to sign up
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               organizationId:
 *                 type: string
 *               # Add other properties from NSOrganizationAdmin.Item as needed
 *           example:
 *             name: "Admin 1"
 *             email: "tamimitarteel@gmail.com"
 *             password: "Tareel123>>"
 *             organizationId: "8995852d-5b2e-4aff-a6fe-3e96cab49add"
 *     responses:
 *       201:
 *         description: Organization admin signed up successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   # Define the structure of the returned data here
 *               example:
 *                 message: "Organization admin signs up successfully"
 *                 data:
 *                   name: "Admin 1"
 *                   email: "tamimitarteel@gmail.com"
 *                   roles: 
 *                      id: 2
 *                      name: "admin"
 *                      createdAt: "2023-10-25T21:42:11.724Z"
 *                   orgProfile:
 *                      id: "8995852d-5b2e-4aff-a6fe-3e96cab49add"
 *                      name: "Test"
 *                      description: "test test"
 *                      createdAt: "2023-10-26T11:00:41.632Z"
 *                   id: "f7ee8f20-eabe-47a7-bd9a-30594765dbf7"
 *                   createdAt: "2023-10-26T20:07:06.810Z"
 *       400:
 *         description: Bad request, validation failed
 */

/**
 * @swagger
 * /organizationAdmin/{id}:
 *   put:
 *     summary: Edit an organization admin by ID
 *     tags: [OrganizationAdmin]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the organization admin to edit
 *     requestBody:
 *       description: Organization admin data to update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               oldPassword:
 *                 type: string
 *               organizationName:
 *                 type: string
 *           example:
 *              name: "New Name"
 *               
 *     responses:
 *       200:
 *         description: Organization admin edited successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               example:
 *                  name: "Updated Organization Admin Name"
 * 
 *       404:
 *         description: Organization admin not found
 */

export default router;