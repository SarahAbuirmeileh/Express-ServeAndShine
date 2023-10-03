import express from 'express';
import { createPermission, deletePermission } from '../controllers/permission.js';
import { getSender } from '../controllers/index.js';

var router = express.Router();

router.post('/', (req, res, next) => {
    createPermission(req.body).then(() => {
        res.status(201).send("Permission created successfully!!")
    }).catch(err => {
        console.error(err);
        res.status(500).send(err);
    });
});

router.delete('/:id', async (req, res) => {
    const id = Number(req.params.id?.toString()) ;
    const  sender = await getSender(res);

    deletePermission(id, sender)
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Something went wrong');
        });
})

export default router;

