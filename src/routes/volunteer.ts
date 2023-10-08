import express from 'express';
import { authorize, checkMe } from '../middleware/auth/authorize.js';
import { authenticate } from '../middleware/auth/authenticate.js';
import { validateEditedVolunteer, validateVolunteer } from '../middleware/validation/volunteer.js';
import { createVolunteer, deleteVolunteer, editVolunteer, getVolunteers, login } from '../controllers/volunteer.js';
import { NSVolunteer } from '../../types/volunteer.js';
import { log } from '../controllers/logs.js';

var router = express.Router();

router.post('/register', validateVolunteer, (req, res, next) => {
    createVolunteer({...req.body,type:"volunteer" }).then(() => {
        log ({
            userId: res.locals.organizationAdmin.id || res.locals.volunteer.id,
            userName: res.locals.organizationAdmin.name || res.locals.volunteer.name,
            userType: 'admin', 
            type: 'success', 
            request: 'Register volunteer'}).then(() => {
                console.log('logged');
            }).catch(err => {
                console.log('NOT logged');
            })
        res.status(201).send("Volunteer created successfully!!")
    }).catch(err => {
        log ({
            userId: res.locals.organizationAdmin.id || res.locals.volunteer.id,
            userName: res.locals.organizationAdmin.name || res.locals.volunteer.name,
            userType: 'admin', 
            type: 'failed', 
            request: 'Register volunteer'}).then(() => {
                console.log('logged');
            }).catch(err => {
                console.log('NOT logged');
            })
        next(err);
    });
});

router.post('/login', (req, res, next) => {
    const email = req.body.email;
    const name = req.body.name;
    const id = req.body.id;
    login(email, name, id)
        .then(data => {
            res.cookie('myApp', data, {
                httpOnly: true,
                maxAge: 60 *24 * 60 * 1000,
                sameSite: "lax"       // Protect against CSRF attacks
            });
            log ({
                userId: res.locals.organizationAdmin.id || res.locals.volunteer.id,
                userName: res.locals.organizationAdmin.name || res.locals.volunteer.name,
                userType: 'admin', 
                type: 'success', 
                request: 'Login'}).then(() => {
                    console.log('logged');
                }).catch(err => {
                    console.log('NOT logged');
                })
            res.status(201).send("You logged in successfully !");
        })
        .catch(err => {
            log ({
                userId: res.locals.organizationAdmin.id || res.locals.volunteer.id,
                userName: res.locals.organizationAdmin.name || res.locals.volunteer.name,
                userType: 'admin', 
                type: 'failed', 
                request: 'Login'}).then(() => {
                    console.log('logged');
                }).catch(err => {
                    console.log('NOT logged');
                })
            res.status(401).send(err);
        })
});

router.delete('/:id', authenticate, authorize("DELETE_volunteer"), async (req, res, next) => {
    const id = req.params.id?.toString();

    deleteVolunteer(id)
        .then(data => {
            log ({
                userId: res.locals.organizationAdmin.id || res.locals.volunteer.id,
                userName: res.locals.organizationAdmin.name || res.locals.volunteer.name,
                userType: 'admin', 
                type: 'success', 
                request: 'Delete Volunteer'}).then(() => {
                    console.log('logged');
                }).catch(err => {
                    console.log('NOT logged');
                })
            res.send(data);
        })
        .catch(error => {
            log ({
                userId: res.locals.organizationAdmin.id || res.locals.volunteer.id,
                userName: res.locals.organizationAdmin.name || res.locals.volunteer.name,
                userType: 'admin', 
                type: 'failed', 
                request: 'Delete Volunteer'}).then(() => {
                    console.log('logged');
                }).catch(err => {
                    console.log('NOT logged');
                })
            next(error);
        });
})

router.put("/:id", authenticate, authorize("PUT_volunteer"), validateEditedVolunteer, async (req, res, next) => {
    editVolunteer({ ...req.body, id: req.params.id?.toString() }).then(() => {
        log ({
            userId: res.locals.organizationAdmin.id || res.locals.volunteer.id,
            userName: res.locals.organizationAdmin.name || res.locals.volunteer.name,
            userType: 'admin', 
            type: 'success', 
            request: 'Edit Volunteer'}).then(() => {
                console.log('logged');
            }).catch(err => {
                console.log('NOT logged');
            })
        res.status(201).send("Volunteer edited successfully!!")
    }).catch(err => {
        log ({
            userId: res.locals.organizationAdmin.id || res.locals.volunteer.id,
            userName: res.locals.organizationAdmin.name || res.locals.volunteer.name,
            userType: 'admin', 
            type: 'failed', 
            request: 'Edit Volunteer'}).then(() => {
                console.log('logged');
            }).catch(err => {
                console.log('NOT logged');
            })
        next(err);
    });
});

router.get('/', authenticate, authorize("GET_volunteers"), async (req, res, next) => {
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
            log ({
                userId: res.locals.organizationAdmin.id || res.locals.volunteer.id,
                userName: res.locals.organizationAdmin.name || res.locals.volunteer.name,
                userType: 'admin', 
                type: 'success', 
                request: 'get Volunteer/s'}).then(() => {
                    console.log('logged');
                }).catch(err => {
                    console.log('NOT logged');
                })
            res.send(data);
        })
        .catch(err => {
            log ({
                userId: res.locals.organizationAdmin.id || res.locals.volunteer.id,
                userName: res.locals.organizationAdmin.name || res.locals.volunteer.name,
                userType: 'admin', 
                type: 'failed', 
                request: 'Get Volunteer/s'}).then(() => {
                    console.log('logged');
                }).catch(err => {
                    console.log('NOT logged');
                })
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

    res.send("You logged out successfully !");
})

router.get('/me', authenticate, authorize("GET_me"), async (req, res, next) => {
    if (res.locals.volunteer) {
        res.send(res.locals.volunteer);
    } else if (res.locals.organizationAdmin) {
        res.send(res.locals.organizationAdmin);
    }
});

export default router;

