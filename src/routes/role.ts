import express from 'express';
import { createRole, deleteRole, editRole, getRole, getRoles } from '../controllers/role.js';

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

router.put("/", async (req, res, next) => {
    editRole(req.body).then(() => {
        res.status(201).send("Role edited successfully!!")
    }).catch(err => {
        console.error(err);
        res.status(500).send(err);
    });
});

router.get("/:id", async (req, res) => {
    const id = Number(req.params.id)

    const role = await getRole({ id });
    if (role) {
        res.status(201).send(role);
    } else {
        res.status(404).send("Role not found :(");
    }
})

router.get('/', async (req, res, next) => {
    const payload = {
        page: req.query.page?.toString() || '1',
        pageSize: req.query.pageSize?.toString() || '10'
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

