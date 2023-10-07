import express from 'express';
import { createVoluntaryWork, deleteVoluntaryWork, deregisterVoluntaryWork, editVoluntaryWork, getVoluntaryWork, getVoluntaryWorks, putFeedback, putImages, putRating, registerByOrganizationAdmin, registerByVolunteer } from '../controllers/voluntaryWork.js';
import { NSVolunteer } from '../../types/volunteer.js';
import { NSVoluntaryWork } from '../../types/voluntaryWork.js';
import { authorize, checkCreator, checkParticipation } from '../middleware/auth/authorize.js';
import { validateEditedVoluntaryWork, validateVoluntaryWork } from '../middleware/validation/voluntaryWork.js';
import { UploadedFile } from 'express-fileupload';

var router = express.Router();

router.post('/', authorize("POST_voluntaryWork"), validateVoluntaryWork, (req, res, next) => {
    createVoluntaryWork({ ...req.body, creatorId: res.locals.volunteer.id || res.locals.organizationAdmin.id }).then(() => {
        res.status(201).send("Voluntary work created successfully!!")
    }).catch(err => {
        // console.error(err);
        // res.status(500).send(err);
        next(err);
    });
});

router.delete('/:id', authorize("DELETE_voluntaryWork"), checkCreator, async (req, res, next) => {
    const id = Number(req.params.id?.toString());

    deleteVoluntaryWork(id)
        .then(data => {
            res.send("Deleted");
        })
        .catch(err => {
            // res.status(500).send('Something went wrong');
            next(err);
        });
})

router.put("/:id", authorize("PUT_voluntaryWork"), checkCreator,validateEditedVoluntaryWork, async (req, res, next) => {
    editVoluntaryWork({ ...req.body, id: req.params.id?.toString() }).then(() => {
        res.status(201).send("Voluntary Work edited successfully!!")
    }).catch(err => {
        // console.error(err);
        // res.status(500).send(err);
        next(err);
    });
});

router.get('/', authorize("GET_voluntaryWorks"), async (req, res, next) => {

    const payload = {
        page: req.query.page?.toString() || '1',
        pageSize: req.query.pageSize?.toString() || '10',
        id: Number(req.query.id) || 0,
        name: req.query.name?.toString() || '',
        time: ((Array.isArray(req.query.time) ? req.query.time : [req.query.time]).filter(Boolean)) as NSVolunteer.AvailableTime[],
        location: (typeof req.query.location === 'string' ? req.query.location : ''),
        days: (Array.isArray(req.query.days) ? req.query.days : [req.query.days]).filter(Boolean) as NSVolunteer.AvailableDays[],
        rating: Number(req.query.rating) || 0,
        status: req.query.status as NSVoluntaryWork.StatusType,
        skills: (Array.isArray(req.query.skills) ? req.query.skills : [req.query.skills]).filter(Boolean) as string[],
        startedDate: req.query.startedDate?.toString() || "",
        finishedDate: req.query.finishedDate?.toString() || "",
        capacity: Number(req.query.capacity) || 0,
        finishedAfter: "",
        finishedBefore: "",
        startedAfter: "",
        startedBefore: "",
        ratingMore: Number(req.query.ratingMore) || 0,
        ratingLess: Number(req.query.ratingLess) || 0,
        creatorId: ""
    };

    getVoluntaryWorks(payload)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            // console.error(error);
            // res.status(500).send('Something went wrong');
            next(err);
        });
});

router.get('/analysis', authorize("GET_analysis"), async (req, res, next) => {

    const payload = {
        page: req.query.page?.toString() || '1',
        pageSize: req.query.pageSize?.toString() || '10',
        id: Number(req.query.id) || 0,
        name: req.query.name?.toString() || '',
        time: ((Array.isArray(req.query.time) ? req.query.time : [req.query.time]).filter(Boolean)) as NSVolunteer.AvailableTime[],
        location: (typeof req.query.location === 'string' ? req.query.location : ''),
        days: (Array.isArray(req.query.days) ? req.query.days : [req.query.days]).filter(Boolean) as NSVolunteer.AvailableDays[],
        rating: Number(req.query.rating) || 0,
        status: req.query.status as NSVoluntaryWork.StatusType,
        skills: (Array.isArray(req.query.skills) ? req.query.skills : [req.query.skills]).filter(Boolean) as string[],
        startedDate: req.query.startedDate?.toString() || "",
        finishedDate: req.query.finishedDate?.toString() || "",
        capacity: Number(req.query.capacity) || 0,
        finishedAfter: req.query.finishedDate?.toString() || "",
        finishedBefore: req.query.finishedBefore?.toString() || "",
        startedAfter: req.query.startedAfter?.toString() || "",
        startedBefore: req.query.startedBefore?.toString() || "",
        ratingMore: Number(req.query.ratingMore) || 0,
        ratingLess: Number(req.query.ratingLess) || 0,
        creatorId: req.query.creatorId?.toString() || ""
    };

    getVoluntaryWorks(payload)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            // console.error(error);
            // res.status(500).send('Something went wrong');
            next(err);
        });
});

router.get('/recommendation', authorize("GET_recommendation"), async (req, res, next) => {
    const payload = { ...res.locals.volunteer };
    getVoluntaryWorks(payload)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            // console.error(error);
            // res.status(500).send('Something went wrong');
            next(err);
        });
});

router.put("/rating/:id", authorize("PUT_rating"), checkParticipation, async (req, res, next) => {
    putRating(Number(req.params.id), Number(req.body.rating)).then(() => {
        res.status(201).send("Rating added successfully!!")
    }).catch(err => {
        // console.error(err);
        // res.status(500).send(err);
        next(err);
    });
});

router.put("/feedback/:id", authorize("PUT_feedback"), checkParticipation, async (req, res, next) => {
    putFeedback(Number(req.params.id), req.body.feedback).then(() => {
        res.status(201).send("Feedback added successfully!!")
    }).catch(err => {
        // console.error(err);
        // res.status(500).send(err);
        next(err);
    });
});

router.put("/images/:id", authorize("PUT_images"), async (req, res, next) => {
    putImages(Number(req.params.id), ((Array.isArray(req.files?.image) ? req.files?.image : [req.files?.image]).filter(Boolean)) as UploadedFile[]).then(() => {
        res.status(201).send("Images added successfully!!")
    }).catch(err => {
        // console.error(err);
        // res.status(500).send(err);
        next(err);
    });
});

router.put("/register/:id", authorize("REGISTER_voluntaryWork"), async (req, res, next) => {
    if (res.locals.volunteer) {
        registerByVolunteer(Number(req.params.id), res.locals.volunteer["volunteerProfile"]).then(() => {
            res.status(201).send("Registration done successfully!!")
        }).catch(err => {
            // console.error(err);
            // res.status(500).send(err);
            next(err);
        });
    } else if (res.locals.organizationAdmin) {
        if (!req.body.volunteerId.toString()) {
            res.status(400).send("volunteer id is required!");
        }

        registerByOrganizationAdmin(Number(req.params.id), req.body.volunteerId.toString()).then(() => {
            res.status(201).send("Registration done successfully!!")
        }).catch(err => {
            // console.error(err);
            // res.status(500).send(err);
            next(err);
        });
    }
});

router.put("/deregister/:id", authorize("DEREGISTER_voluntaryWork"), async (req, res, next) => {
    if( res.locals.volunteer.id || req.body.volunteerId.toString()){
        res.status(400).send("Volunteer id is required !");
    }
    deregisterVoluntaryWork(Number(req.params.id), res.locals.volunteer.id || req.body.volunteerId.toString()).then(() => {
        res.status(201).send("Deregistration done successfully!!")
    }).catch(err => {
        // console.error(err);
        // res.status(500).send(err);
        next(err);
    });
});

export default router;