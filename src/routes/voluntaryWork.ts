import express from 'express';
import { createVoluntaryWork, deleteVoluntaryWork, editVoluntaryWork, getVoluntaryWork, getVoluntaryWorks } from '../controllers/voluntaryWork.js';
import { NSVolunteer } from '../../types/volunteer.js';
import { NSVoluntaryWork } from '../../types/voluntaryWork.js';

var router = express.Router();

router.post('/', (req, res, next) => {
    createVoluntaryWork(req.body).then(() => {
        res.status(201).send("Voluntary work created successfully!!")
    }).catch(err => {
        console.error(err);
        res.status(500).send(err);
    });
});

router.delete('/:id', async (req, res) => {
    const id = Number(req.params.id?.toString());

    deleteVoluntaryWork(id)
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            res.status(500).send('Something went wrong');
        });
})

router.put("/", async (req, res, next) => {
    editVoluntaryWork({ ...req.body, id: req.query.id?.toString() }).then(() => {
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
        finishedAfter: req.query.finishedDate?.toString() || "",
        finishedBefore: req.query.finishedBefore?.toString() || "",
        startedAfter: req.query.startedAfter?.toString() || "",
        startedBefore: req.query.startedBefore?.toString() || ""
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

export default router;

