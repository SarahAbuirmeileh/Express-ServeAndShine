import express from 'express';
import { authorize, checkMe } from '../middleware/auth/authorize.js';
import { authenticate } from '../middleware/auth/authenticate.js';
import { validateEditedVolunteer, validateVolunteer } from '../middleware/validation/volunteer.js';
import { createVolunteer, deleteVolunteer, editVolunteer, getVolunteers, login } from '../controllers/volunteer.js';
import { NSVolunteer } from '../../types/volunteer.js';
import { log } from '../controllers/dataBase-logger.js';
import { NSLogs } from '../../types/logs.js';
import { logToCloudWatch } from '../controllers/AWS-services/AWS-CloudWatch-logs.js';
import { sendEmail } from '../controllers/AWS-services/AWS-SES.js';

var router = express.Router();

router.post('/register', validateVolunteer, (req, res, next) => {
    createVolunteer({ ...req.body, type: "volunteer" }).then((data) => {
        log({
            userId: req.body.id,
            userName: req.body.name,
            userType: req.body.type as NSLogs.userType,
            type: 'success' as NSLogs.Type,
            request: 'Register volunteer ' + req.body.name
        }).then().catch()

        logToCloudWatch(
            'success',
            'volunteer',
            'Register volunteer ' + req.body.name,
            req.body.id,
            req.body.name
        ).then().catch()

        sendEmail(
            req.body.email,
            req.body.name,
            'Registration in Serve And Shine',
            'You have successfully registered in Serve And Shine. You can now view voluntary organizations and works');

        res.status(201).send("Volunteer created successfully!!")
    }).catch(err => {
        log({
            userId: req.body.id,
            userName: req.body.name,
            userType: req.body.type as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Register volunteer' + req.body.name
        }).then().catch()

        logToCloudWatch(
            'failed',
            'volunteer',
            'Register volunteer ' + req.body.name,
            req.body.id,
            req.body.name
        ).then().catch()

        next(err);
    });
});

router.post('/login', (req, res, next) => {
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
            if (data.volunteer) res.locals.volunteer = data.volunteer;
            if (data.organizationAdmin) res.locals.organizationAdmin = data.organizationAdmin;
            log({
                userId: id,
                userName: res.locals.organizationAdmin?.name || res.locals.volunteer?.name,
                userType: (res.locals.volunteer ? res.locals.volunteer?.type : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
                type: 'success' as NSLogs.Type,
                request: 'Login ' + res.locals.organizationAdmin?.name || res.locals.volunteer?.name
            }).then().catch()

            logToCloudWatch(
                'success',
                'volunteer',
                'Login ' + res.locals.organizationAdmin?.name || res.locals.volunteer?.name,
                res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
                res.locals.organizationAdmin?.name || res.locals.volunteer?.name
            ).then().catch()

            res.status(201).send("You logged in successfully !");
        })
        .catch(err => {
            log({
                userId: id,
                userName: name,
                userType: 'volunteer' as NSLogs.userType,
                type: 'failed' as NSLogs.Type,
                request: 'Login ' + res.locals.organizationAdmin?.name || res.locals.volunteer?.name
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

router.delete('/:id', authenticate, authorize("DELETE_volunteer"), async (req, res, next) => {
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
        request: 'Logout ' + res.locals.organizationAdmin?.name || res.locals.volunteer?.name
    }).then().catch()

    logToCloudWatch(
        'success',
        'volunteer',
        'Logout ' + res.locals.organizationAdmin?.name || res.locals.volunteer?.name,
        res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
        res.locals.organizationAdmin?.name || res.locals.volunteer?.name
    ).then().catch()

    res.send("You logged out successfully !");
})

router.get('/me', authenticate, authorize("GET_me"), async (req, res, next) => {
    if (res.locals.volunteer) {
        log({
            userId: res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
            userName: res.locals.organizationAdmin?.name || res.locals.volunteer?.name,
            userType: (res.locals.volunteer ? res.locals.volunteer?.type : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'success' as NSLogs.Type,
            request: 'Get my information'
        }).then().catch()

        logToCloudWatch(
            'success',
            'volunteer',
            'Get my information',
            res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
            res.locals.organizationAdmin?.name || res.locals.volunteer?.name
        ).then().catch()

        res.send(res.locals.volunteer);
    } else if (res.locals.organizationAdmin) {
        log({
            userId: res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
            userName: res.locals.organizationAdmin?.name || res.locals.volunteer?.name,
            userType: (res.locals.volunteer ? res.locals.volunteer?.type : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Get my information'
        }).then().catch()

        logToCloudWatch(
            'failed',
            'volunteer',
            'Get my information',
            res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
            res.locals.organizationAdmin?.name || res.locals.volunteer?.name
        ).then().catch()

        res.send(res.locals.organizationAdmin);
    }
});

export default router;

