import express from 'express';
import { createVoluntaryWork, deleteVoluntaryWork, editVoluntaryWork, getVoluntaryWork, getVoluntaryWorks, putFeedback, putImages, putRating } from '../controllers/voluntaryWork.js';
import { NSVolunteer } from '../../types/volunteer.js';
import { NSVoluntaryWork } from '../../types/voluntaryWork.js';
import { authorize, checkCreator, checkParticipation } from '../middleware/auth/authorize.js';
import { validateVoluntaryWork } from '../middleware/validation/voluntaryWork.js';

var router = express.Router();

router.post('/', authorize("POST_voluntaryWork"), validateVoluntaryWork, (req, res, next) => {
    createVoluntaryWork({ ...req.body, creatorId: res.locals.volunteer.id || res.locals.organizationAdmin.id }).then(() => {
        res.status(201).send("Voluntary work created successfully!!")
    }).catch(err => {
        console.error(err);
        res.status(500).send(err);
    });
});

router.delete('/:id', authorize("DELETE_voluntaryWork"), checkCreator, async (req, res) => {
    const id = Number(req.params.id?.toString());

    deleteVoluntaryWork(id)
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            res.status(500).send('Something went wrong');
        });
})

router.put("/:id", authorize("PUT_voluntaryWork"), checkCreator, async (req, res, next) => {
    editVoluntaryWork({ ...req.body, id: req.params.id?.toString() }).then(() => {
        res.status(201).send("Voluntary Work edited successfully!!")
    }).catch(err => {
        console.error(err);
        res.status(500).send(err);
    });
});

router.get('/', async (req, res, next) => {

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
        .catch(error => {
            console.error(error);
            res.status(500).send('Something went wrong');
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
        creatorId:req.query.creatorId?.toString() || ""
    };

    getVoluntaryWorks(payload)
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Something went wrong');
        });
});

router.get('/recommendation', authorize("GET_recommendation"), async (req, res, next) => {
    const payload = { ...res.locals.volunteer };
    getVoluntaryWorks(payload)
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Something went wrong');
        });
});

router.put("/rating/:id", authorize("PUT_rating"), checkParticipation, async (req, res, next) => {
    putRating(Number(req.params.id), Number(req.body.rating)).then(() => {
        res.status(201).send("Rating added successfully!!")
    }).catch(err => {
        console.error(err);
        res.status(500).send(err);
    });
});

router.put("/feedback/:id", authorize("PUT_feedback"), checkParticipation, async (req, res, next) => {
    putFeedback(Number(req.params.id), req.body.feedback).then(() => {
        res.status(201).send("Feedback added successfully!!")
    }).catch(err => {
        console.error(err);
        res.status(500).send(err);
    });
});

router.put("/images/:id", authorize("PUT_images"), async (req, res, next) => {
    putImages(Number(req.params.id), req.body.images).then(() => {
        res.status(201).send("Images added successfully!!")
    }).catch(err => {
        console.error(err);
        res.status(500).send(err);
    });
});

router.put("/register/:id", authorize("REGISTER_voluntaryWork"), async (req, res, next) => {
});

export default router;

