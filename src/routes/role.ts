import express from 'express';
import { createRole, deleteRole, editRole, getRoles } from '../controllers/role.js';
import { NSRole } from '../../types/role.js';

var router = express.Router();

router.post('/', (req, res, next) => {
    createRole(req.body).then(() => {
        res.status(201).send("Role created successfully!!")
    }).catch(err => {
        console.error(err);
        res.status(500).send(err);
    });
});

router.delete('/:id', async (req, res) => {
    const id = Number(req.params.id?.toString());

    deleteRole(id)
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Something went wrong');
        });
})

router.put("/:id", async (req, res, next) => {
    editRole({...req.body,id: req.params.id?.toString()}).then(() => {
        res.status(201).send("Role edited successfully!!")
    }).catch(err => {
        console.error(err);
        res.status(500).send(err);
    });
});

router.get('/', async (req, res, next) => {
    const payload = {
        page: req.query.page?.toString() || '1',
        pageSize: req.query.pageSize?.toString() || '10',
        id: Number(req.query.id ) || 0,
        name: req.query.name?.toString() as NSRole.Type
    };

    getRoles(payload)
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Something went wrong');
        });
});

export default router;

