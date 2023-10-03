import express from 'express';
import { createVoluntaryWork, deleteVoluntaryWork, editVoluntaryWork, getVoluntaryWork, getVoluntaryWorks } from '../controllers/voluntaryWork.js';

var router = express.Router();

router.post('/', (req, res, next) => {
    createVoluntaryWork(req.body).then(() => {
        res.status(201).send("VoluntaryWork created successfully!!")
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
            console.error(error);
            res.status(500).send('Something went wrong');
        });
})

router.put("/", async (req, res, next) => {
    editVoluntaryWork(req.body).then(() => {
        res.status(201).send("VoluntaryWork edited successfully!!")
    }).catch(err => {
        console.error(err);
        res.status(500).send(err);
    });
});

router.get("/:id", async (req, res) => {
    const id = Number(req.params.id)

    const voluntaryWork = await getVoluntaryWork({ id });
    if (voluntaryWork) {
        res.status(201).send(voluntaryWork);
    } else {
        res.status(404).send("VoluntaryWork not found :(");
    }
})

router.get('/', async (req, res, next) => {
    const payload = {
        page: req.query.page?.toString() || '1',
        pageSize: req.query.pageSize?.toString() || '10'
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

