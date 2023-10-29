import express from 'express';
import { authorize, checkMe } from '../middleware/auth/authorize.js';
import { authenticate } from '../middleware/auth/authenticate.js';
import { validateEditedVolunteer, validateLogin, validateVolunteer, validateVolunteerId } from '../middleware/validation/volunteer.js';
import { createVolunteer, deleteVolunteer, editVolunteer, forgetPassword, getVolunteers, login, resetPassword, verifyToken } from '../controllers/volunteer.js';
import { NSVolunteer } from '../../types/volunteer.js';
import { log } from '../controllers/dataBaseLogger.js';
import { NSLogs } from '../../types/logs.js';
import { logToCloudWatch } from '../controllers/AWSServices/CloudWatchLogs.js';
import { sendEmail } from '../controllers/AWSServices/SES.js';
import { Volunteer } from '../db/entities/Volunteer.js';
import bcrypt from 'bcrypt';
import { isValidPassword } from '../controllers/index.js';


var router = express.Router();

router.post('/signup', validateVolunteer, (req, res, next) => {
    createVolunteer({ ...req.body, type: "volunteer" }).then((data) => {
        log({
            userId: data.id,
            userName: req.body.name,
            userType: data.type as NSLogs.userType,
            type: 'success' as NSLogs.Type,
            request: 'Signup volunteer ' + req.body.name
        }).then().catch()

        logToCloudWatch(
            'success',
            'volunteer',
            'Signup volunteer ' + req.body.name,
            data.id,
            req.body.name
        ).then().catch()

        sendEmail(
            req.body.email,
            req.body.name,
            'Signup volunteer in Serve And Shine',
            'You have successfully registered in Serve And Shine. You can now view voluntary organizations and works');

        const { password, ...dataWithoutPassword } = data;
        res.status(201).send({ message: "Volunteer created successfully!!", dataWithoutPassword })
    }).catch(async err => {
        if (err.message.includes("Converting circular structure")) {
            const data = await Volunteer.findOne({ where: { id: req.body.id } });
            if (data) {

                log({
                    userId: data.id,
                    userName: req.body.name,
                    userType: data.type as NSLogs.userType,
                    type: 'success' as NSLogs.Type,
                    request: 'Signup volunteer ' + req.body.name
                }).then().catch()

                logToCloudWatch(
                    'success',
                    'volunteer',
                    'Signup volunteer ' + req.body.name,
                    data.id,
                    req.body.name
                ).then().catch()

                sendEmail(
                    req.body.email,
                    req.body.name,
                    'Signup volunteer in Serve And Shine',
                    'You have successfully registered in Serve And Shine. You can now view voluntary organizations and works');

                const { password, ...dataWithoutPassword } = data;
                res.status(201).send({ message: "Volunteer created successfully!!", dataWithoutPassword })
            }

        } else {
            log({
                userId: "",
                userName: req.body.name,
                userType: req.body.type as NSLogs.userType,
                type: 'failed' as NSLogs.Type,
                request: 'Signup volunteer ' + req.body.name
            }).then().catch()

            logToCloudWatch(
                'failed',
                'volunteer',
                'Signup volunteer ' + req.body.name,
                "",
                req.body.name
            ).then().catch()
            next(err);
        }
    });
});

router.post('/login', validateLogin, (req, res, next) => {
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
                userType: (data.volunteer?.type) as NSLogs.userType,
                type: 'success' as NSLogs.Type,
                request: 'Login ' + (name)
            }).then().catch()

            logToCloudWatch(
                'success',
                'volunteer',
                'Login ' + (name),
                id,
                name
            ).then().catch()

            res.status(201).send("You logged in successfully !");
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
                'volunteer',
                'Login ' + name,
                id,
                name
            ).then().catch()

            res.status(401).send(err);
        })
});

router.delete('/:id', authenticate, authorize("DELETE_volunteer"), validateVolunteerId, async (req, res, next) => {
    const id = req.params.id?.toString();

    deleteVolunteer(id)
        .then(data => {
            log({
                userId: res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
                userName: res.locals.organizationAdmin?.name || res.locals.volunteer?.name,
                userType: (res.locals.volunteer ? res.locals.volunteer?.type : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
                type: 'success' as NSLogs.Type,
                request: 'Delete Volunteer with id: ' + id
            }).then().catch()

            logToCloudWatch(
                'success',
                'volunteer',
                'Delete Volunteer with id: ' + id,
                res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
                res.locals.organizationAdmin?.name || res.locals.volunteer?.name
            ).then().catch()

            res.send(data);
        })
        .catch(error => {
            log({
                userId: res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
                userName: res.locals.organizationAdmin?.name || res.locals.volunteer?.name,
                userType: (res.locals.volunteer ? res.locals.volunteer?.type : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
                type: 'failed' as NSLogs.Type,
                request: 'Delete Volunteer with id: ' + id
            }).then().catch()

            logToCloudWatch(
                'failed',
                'volunteer',
                'Delete Volunteer with id: ' + id,
                res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
                res.locals.organizationAdmin?.name || res.locals.volunteer?.name
            ).then().catch()

            next(error);
        });
})

router.put("/:id", authenticate, authorize("PUT_volunteer"), validateEditedVolunteer, async (req, res, next) => {
    editVolunteer({ ...req.body, id: req.params.id?.toString() }).then(() => {
        log({
            userId: res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
            userName: res.locals.organizationAdmin?.name || res.locals.volunteer?.name,
            userType: (res.locals.volunteer ? res.locals.volunteer?.type : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'success' as NSLogs.Type,
            request: 'Edit Volunteer with id: ' + req.params.id?.toString()
        }).then().catch()

        logToCloudWatch(
            'success',
            'volunteer',
            'Edit Volunteer with id: ' + req.params.id?.toString(),
            res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
            res.locals.organizationAdmin?.name || res.locals.volunteer?.name
        ).then().catch()

        res.status(201).send("Volunteer edited successfully!!")
    }).catch(err => {
        log({
            userId: res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
            userName: res.locals.organizationAdmin?.name || res.locals.volunteer?.name,
            userType: (res.locals.volunteer ? res.locals.volunteer?.type : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Edit Volunteer with id: ' + req.params.id?.toString()
        }).then().catch()

        logToCloudWatch(
            'failed',
            'volunteer',
            'Edit Volunteer with id: ' + req.params.id?.toString(),
            res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
            res.locals.organizationAdmin?.name || res.locals.volunteer?.name
        ).then().catch()

        next(err);
    });
});

router.get('/search', authenticate, authorize("GET_volunteers"), async (req, res, next) => {
    const payload = {
        page: req.query.page?.toString() || '1',
        pageSize: req.query.pageSize?.toString() || '10',
        id: req.query.id?.toString() || "",
        name: req.query.name?.toString() || "",
        email: req.query.email?.toString() || "",
        availableLocation: req.query.availableLocation?.toString() || "",
        skills: ((Array.isArray(req.query.skills) ? req.query.skills : [req.query.skills]).filter(Boolean)) as string[],
        type: req.query.type as NSVolunteer.TypeVolunteer,
        availableDays: (Array.isArray(req.query.availableDays) ? req.query.availableDays : [req.query.availableDays]).filter(Boolean) as NSVolunteer.AvailableDays[],
        availableTime: ((Array.isArray(req.query.availableTime) ? req.query.availableTime : [req.query.availableTime]).filter(Boolean)) as NSVolunteer.AvailableTime[],
        password: ""
    };

    getVolunteers(payload)
        .then(data => {
            log({
                userId: res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
                userName: res.locals.organizationAdmin?.name || res.locals.volunteer?.name,
                userType: (res.locals.volunteer ? res.locals.volunteer?.type : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
                type: 'success' as NSLogs.Type,
                request: 'get Volunteer/s'
            }).then().catch()

            logToCloudWatch(
                'success',
                'volunteer',
                'get Volunteer/s',
                res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
                res.locals.organizationAdmin?.name || res.locals.volunteer?.name
            ).then().catch()

            res.send(data);
        })
        .catch(err => {
            log({
                userId: res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
                userName: res.locals.organizationAdmin?.name || res.locals.volunteer?.name,
                userType: (res.locals.volunteer ? res.locals.volunteer?.type : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
                type: 'failed' as NSLogs.Type,
                request: 'Get Volunteer/s'
            }).then().catch()

            logToCloudWatch(
                'failed',
                'volunteer',
                'get Volunteer/s',
                res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
                res.locals.organizationAdmin?.name || res.locals.volunteer?.name
            ).then().catch()

            next(err);
        });
});

router.get("/logout", authenticate, (req, res, next) => {
    res.cookie("name", '', {
        maxAge: -1
    })
    res.cookie("myApp", '', {
        maxAge: -1
    })
    log({
        userId: res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
        userName: res.locals.organizationAdmin?.name || res.locals.volunteer?.name,
        userType: (res.locals.volunteer ? res.locals.volunteer?.type : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
        type: 'success' as NSLogs.Type,
        request: 'Logout ' + (res.locals.organizationAdmin?.name || res.locals.volunteer?.name)
    }).then().catch()

    logToCloudWatch(
        'success',
        'volunteer',
        'Logout ' + (res.locals.organizationAdmin?.name || res.locals.volunteer?.name),
        res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
        res.locals.organizationAdmin?.name || res.locals.volunteer?.name
    ).then().catch()

    res.send("You logged out successfully !");
})

router.get('/me', authenticate, async (req, res, next) => {
    if (res.locals.volunteer) {
        log({
            userId: res.locals.volunteer?.id,
            userName: res.locals.volunteer?.name,
            userType: (res.locals.volunteer?.type) as NSLogs.userType,
            type: 'success' as NSLogs.Type,
            request: 'Get my information'
        }).then().catch()

        logToCloudWatch(
            'success',
            'volunteer',
            'Get my information',
            res.locals.volunteer?.id,
            res.locals.volunteer?.name
        ).then().catch()

        res.send(res.locals.volunteer);
    } else if (res.locals.organizationAdmin) {
        log({
            userId: res.locals.organizationAdmin?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: (res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Get my information'
        }).then().catch()

        logToCloudWatch(
            'failed',
            'organization admin',
            'Get my information',
            res.locals.organizationAdmin?.id,
            res.locals.organizationAdmin?.name
        ).then().catch()

        res.send(res.locals.organizationAdmin);
    }
});

router.get("/forget-password", authenticate, authorize("PUT_rating"), (req, res, next) => {
    forgetPassword(res.locals.volunteer?.id, res.locals.volunteer?.email).then(() => {
        log({
            userId: res.locals.volunteer?.id,
            userName: res.locals.volunteer?.name,
            userType: (res.locals.volunteer?.type) as NSLogs.userType,
            type: 'success' as NSLogs.Type,
            request: 'Forget  password volunteer id ' + res.locals.volunteer?.id
        }).then().catch()

        logToCloudWatch(
            'success',
            'volunteer',
            'Forget  password volunteer id ' + res.locals.volunteer?.id,
            res.locals.volunteer?.id,
            res.locals.volunteer?.name
        ).then().catch()

        res.send("Password reset link has been sent to your email")
    }).catch(err => {
        log({
            userId: res.locals.volunteer?.id,
            userName: res.locals.volunteer?.name,
            userType: (res.locals.volunteer?.type) as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Forget  password volunteer id ' + res.locals.volunteer?.id
        }).then().catch()

        logToCloudWatch(
            'failed',
            'volunteer',
            'Forget  password volunteer id ' + res.locals.volunteer?.id,
            res.locals.volunteer?.id,
            res.locals.volunteer?.name
        ).then().catch()

        next(err);
    })
})

router.get("/reset-password/:id/:token", authenticate, authorize("PUT_rating"), async (req, res, next) => {
    const { id, token } = req.params;

    try {
        await verifyToken(id, token);
        res.cookie('reset-password', token, {
            httpOnly: true,
            maxAge: 15 * 60 * 1000,
            sameSite: "lax"
        });
        log({
            userId: res.locals.volunteer?.id,
            userName: res.locals.volunteer?.name,
            userType: (res.locals.volunteer?.type) as NSLogs.userType,
            type: 'success' as NSLogs.Type,
            request: 'Validate token to reset password for volunteer id ' + res.locals.volunteer?.id
        }).then().catch()

        logToCloudWatch(
            'success',
            'volunteer',
            'Validate token to reset password for volunteer id ' + res.locals.volunteer?.id,
            res.locals.volunteer?.id,
            res.locals.volunteer?.name
        ).then().catch()
        res.send("You can now set your new password by making a POST request to /reset-password/:id with your new password in the request body.");
    } catch (error) {
        log({
            userId: res.locals.volunteer?.id,
            userName: res.locals.volunteer?.name,
            userType: (res.locals.volunteer?.type) as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Validate token to reset password for volunteer id ' + res.locals.volunteer?.id
        }).then().catch()

        logToCloudWatch(
            'failed',
            'volunteer',
            'Validate token to reset password for volunteer id ' + res.locals.volunteer?.id,
            res.locals.volunteer?.id,
            res.locals.volunteer?.name
        ).then().catch()

        res.status(500).send("Invalid or expired token.");
    }
});

router.post("/reset-password/:id", authenticate, authorize("PUT_rating"), async (req, res, next) => {
    const id = req.params.id;
    const token = req.cookies['reset-password'] || '';
    const password = req.body.password;
    //  if(!password || !isValidPassword(password) )next() bad request
    resetPassword(id, token, password).then(data => {
        log({
            userId: res.locals.volunteer?.id,
            userName: res.locals.volunteer?.name,
            userType: (res.locals.volunteer?.type) as NSLogs.userType,
            type: 'success' as NSLogs.Type,
            request: 'Reset password for volunteer id ' + res.locals.volunteer?.id
        }).then().catch()

        logToCloudWatch(
            'success',
            'volunteer',
            'Reset password for volunteer id ' + res.locals.volunteer?.id,
            res.locals.volunteer?.id,
            res.locals.volunteer?.name
        ).then().catch()

        res.status(200).send(data)
    }).catch(err => {
        log({
            userId: res.locals.volunteer?.id,
            userName: res.locals.volunteer?.name,
            userType: (res.locals.volunteer?.type) as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Reset password for volunteer id ' + res.locals.volunteer?.id
        }).then().catch()

        logToCloudWatch(
            'failed',
            'volunteer',
            'Reset password for volunteer id ' + res.locals.volunteer?.id,
            res.locals.volunteer?.id,
            res.locals.volunteer?.name
        ).then().catch()

        // res.send(err)
    })
});

/**
 * @swagger
 * tags:
 *   name: Volunteer
 *   description: The Volunteer managing API
 */


/**
 * @swagger
 * /volunteer/login:
 *   post:
 *     summary: Login a volunteer
 *     tags: [Volunteer]
 *     requestBody:
 *       description: Volunteer data to sign up
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
 *             name: "Volunteer 1"
 *             email: "volunteer1@gmail.com"
 *             id: "9635940b-6176-4148-8e62-7801233e9f85"
 *     responses:
 *       200:
 *         description: Volunteer loged in successfully
 *       401:
 *         description: Volunteer unauthorized
 */

/**
 * @swagger
 * /volunteer/logout:
 *   get:
 *     summary: Logout a volunteer
 *     tags: [Volunteer]
 *     responses:
 *       200:
 *         description: Volunteer loged out successfully
 *       401:
 *         description: Volunteer unauthorized
 */

/**
 * @swagger
 * /volunteer/search:
 *   get:
 *     summary: Get volunteer based on the provided query parameters
 *     tags: [Volunteer]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         description: Filter volunteer by ID
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter volunteer by name
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filter volunteer by email
 *       - in: query
 *         name: availableLocation
 *         schema:
 *           type: string
 *         description: Filter volunteer by availableLocation
 *       - in: query
 *         name: availableTime
 *         schema:
 *           type: string
 *         description: Filter volunteer by availableTime
 *       - in: query
 *         name: availableDays
 *         schema:
 *           type: string
 *         description: Filter volunteer by availableDays
 *     responses:
 *       200:
 *         description: Find volunteer
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
 *                 volunteers:
 *                   type: array
 *                   items:
 *                     type: object
 *               example:
 *                 page: 1
 *                 pageSize: 10
 *                 total: 1
 *                 volunteers:
 *                   - name: "Volunteer 1"
 *                     email: "volunteer1@gamil.com"
 *                     type: "volunteer"
 *                     volunteerProfile:
 *                         availableTime: ["Afternoon"]
 *                         availableDays: ["Wednesday", "Saturday"]
 *                     availableLocation: "main"
 *                     dateOfBirth: null
 *                     skillTags: ["softskills"]
 *                     
 *       404:
 *         description: Volunteer not found
 */

/**
 * @swagger
 * /volunteer/{id}:
 *   delete:
 *     summary: Delete a volunteer by ID
 *     tags: [Volunteer]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the volunteer to delete
 *     responses:
 *       200:
 *         description: Volunteer deleted successfully
 *       404:
 *         description: Volunteer not found
 */

/**
 * @swagger
 * /volunteer/me:
 *   get:
 *     summary: Get information about loged in volunteer
 *     tags: [Volunteer]
 *     responses:
 *       200:
 *         description: Find me
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 volunteer:
 *                   type: array
 *                   items:
 *                     type: object
 *               example:
 *                 volunteer:
 *                   - id: "1ff02f01-a8fd-4438-932b-df62b4a28dc2"
 *                     name: "Volunteer 1"
 *                     email: "volunteer1@gamil.com"
 *                     password: "$2b$10$UodozOgAHz3HFr5tEwGcuuOuoGn/dJ8s07NBdQnyWMn8le5fMc.kO"
 *                     type: "volunteer"
 *                     createdAt: "2023-10-27T13:31:16.941Z"
 *                     roles:
 *                        id: 4
 *                        name: "volunteer"
 *                        createdAt: "2023-10-25T21:42:11.784Z"
 *                        permissions:
 *                             - id: 1
 *                               name: "GET_me"
 *                               createdAt: "2023-10-25T21:40:56.000Z"
 *                             - id: 2
 *                               name: "GET_volunteers"
 *                               createdAt: "2023-10-25T21:40:56.000Z"
 *                     volunteerProfile:
 *                         id: "c9e2bca2-5060-4c9e-bae7-60480e590d1"
 *                         availableTime: ["Afternoon"]
 *                         availableDays: ["Wednesday", "Saturday"]
 *                         availableLocation: "main"
 *                         dateOfBirth: null
 *                         skillTags: 
 *                             id: 1
 *                             name: "softskills"
 *                             createdAt: "2023-10-27T08:56:15.498Z"
 *                         voluntaryWorks: []
 *       401:
 *         description: Volunteer unauthorized
 */

/**
 * @swagger
 * /volunteer/signup:
 *   post:
 *     summary: Sign up a volunteer
 *     tags: [Volunteer]
 *     requestBody:
 *       description: Volunteer data to sign up
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
 *               availableTime:
 *                 type: array
 *                 items:
 *                   type: string
 *               availableDays:
 *                 type: array
 *                 items:
 *                   type: string
 *               availableLocation:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                    type: string
 *               # Add other properties from NSVolunteer.Item as needed
 *           example:
 *             name: "Volunteer 1"
 *             email: "volunteer1@gmail.com"
 *             password: "volunteer123?"
 *             availableTime: ["Afternoon"]
 *             availableDays: ["Saturday", "Wednesday"]
 *             availableLocation: "main"
 *             skills: ["softskills"]
 *     responses:
 *       201:
 *         description: Volunteer signed up successfully
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
 *                 message: "Volunteer signs up successfully"
 *                 dataWithoutPassword:
 *                   id: "7bd5f299-20b6-4aa5-87e4-fc416274f6b4"
 *                   name: "Volunteer 1"
 *                   email: "volunteer1@gmail.com"
 *                   type: "volunteer"
 *                   createdAt: "2023-10-27T08:56:15.827Z"
 *       400:
 *         description: Bad request, validation failed
 */

/**
 * @swagger
 * /volunteer/{id}:
 *   put:
 *     summary: Edit a volunteer by ID
 *     tags: [Volunteer]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the volunteer to edit
 *     requestBody:
 *       description: Volunteer data to update
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
 *           example:
 *              name: "New Name"
 *               
 *     responses:
 *       200:
 *         description: Volunteer edited successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               example:
 *                  name: "Updated Volunteer Name"
 * 
 *       404:
 *         description: Volunteer not found
 */

/**
 * @swagger
 * /volunteer/forget-password:
 *   get:
 *     summary: Send a password reset link to a volunteer's email
 *     tags: [Volunteer]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Password reset link sent successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Password reset link has been sent to your email
 *       401:
 *         description: Volunteer unauthorized
 *       403:
 *         description: You don't have the permission.
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /volunteer/reset-password/{id}/{token}:
 *   get:
 *     summary: Validate a password reset token for a volunteer
 *     tags: [Volunteer]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the volunteer.
 *         schema:
 *           type: string
 *       - name: token
 *         in: path
 *         required: true
 *         description: The password reset token.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Token validated successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: You can now set your new password by making a POST request to /reset-password/{id} with your new password in the request body.
 *       401:
 *          description: Volunteer unauthorized
 *       403:
 *          description: You don't have the permission.
 
 *       500:
 *          description: Invalid or expired token.
 */

/**
 * @swagger
 * /volunteer/reset-password/{id}:
 *   post:
 *     summary: Reset the password for a volunteer
 *     tags: [Volunteer]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the volunteer.
 *         schema:
 *           type: string

 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Password updated successfully!!
 *       401:
 *          description: Volunteer unauthorized
 *       403:
 *          description: You don't have the permission.
 *       400:
 *         description: Your request is BAD,
 *       500:
 *         description: Internal Server Error
 */

export default router;

