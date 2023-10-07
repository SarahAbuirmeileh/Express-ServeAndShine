import express from 'express';
import { authorize, checkMe } from '../middleware/auth/authorize.js';
import { authenticate } from '../middleware/auth/authenticate.js';
import { validateEditedVolunteer, validateVolunteer } from '../middleware/validation/volunteer.js';
import { createVolunteer, deleteVolunteer, editVolunteer, getVolunteers, login } from '../controllers/volunteer.js';
import { NSVolunteer } from '../../types/volunteer.js';

var router = express.Router();

router.post('/register', validateVolunteer, (req, res, next) => {
    createVolunteer(req.body).then(() => {
        res.status(201).send("Volunteer created successfully!!")
    }).catch(err => {
        console.error(err);
        res.status(500).send(err);
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
                maxAge: 15 * 60 * 1000,
                sameSite: "lax"       // Protect against CSRF attacks
            });
            res.cookie('name', res.locals.volunteer.name || res.locals.organizationAdmin.name, {
                httpOnly: true,
                maxAge: 15 * 60 * 1000,
                sameSite: "lax"       // Protect against CSRF attacks
            });
            res.status(201).send(data);
        })
        .catch(err => {
            res.status(401).send(err);
        })
});

router.delete('/:id', authenticate, authorize("DELETE_volunteer"), checkMe, async (req, res) => {
    const id = Number(req.params.id?.toString());

    deleteVolunteer(id)
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Something went wrong');
        });
})

router.put("/:id", authenticate, authorize("POST_volunteer"), checkMe, validateEditedVolunteer,async (req, res, next) => {
    editVolunteer({ ...req.body, id: req.params.id?.toString() }).then(() => {
        res.status(201).send("Volunteer edited successfully!!")
    }).catch(err => {
        console.error(err);
        res.status(500).send(err);
    });
});

router.get('/', authenticate, authorize("GET_volunteers"), async (req, res, next) => {
    const payload = {
        page: req.query.page?.toString() || '1',
        pageSize: req.query.pageSize?.toString() || '10',
        id: req.query.id?.toString()|| "",
        name: req.query.name?.toString() || "",
        email: req.query.email?.toString() || "",
        availableLocation: req.query.availableLocation?.toString() || "",
        skills: ((Array.isArray(req.query.skills) ? req.query.skills : [req.query.skills]).filter(Boolean)) as string[],
        type: req.query.status as NSVolunteer.TypeVolunteer,
        availableDays: (Array.isArray(req.query.availableDays) ? req.query.availableDays : [req.query.availableDays]).filter(Boolean) as NSVolunteer.AvailableDays[],
        availableTime: ((Array.isArray(req.query.availableTime) ? req.query.availableTime : [req.query.availableTime]).filter(Boolean)) as NSVolunteer.AvailableTime[],
        password:""
    };

    getVolunteers(payload)
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Something went wrong');
        });
});

router.get("/logout", authenticate, (req, res, next) => {
    res.cookie("name", '', {
        maxAge: -1
    })
    res.cookie("myApp", '', {
        maxAge: -1
    })

    res.send("Logout correctly!");
})

router.get('/me', authenticate, async (req, res, next) => {
    if (res.locals.volunteer) {
        res.send(res.locals.volunteer);
    } else if (res.locals.organizationAdmin) {
        res.send(res.locals.organizationAdmin);
    }
});

export default router;

