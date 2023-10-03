import express from 'express';
import { createPermission, deletePermission, editPermission, getPermission, getPermissions } from '../controllers/permission.js';
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
    const id = Number(req.params.id?.toString());
    const sender = await getSender(res);

    deletePermission(id, sender)
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Something went wrong');
        });
})

router.put("/", async (req, res, next) => {
    const sender = await getSender(res);

    editPermission(req.body, sender).then(() => {
        res.status(201).send("Permission edited successfully!!")
    }).catch(err => {
        console.error(err);
        res.status(500).send(err);
    });
});

router.get("/:id", async (req, res) => {
    const id = Number(req.params.id)

    const permission = await getPermission({ id });
    if (permission) {
        res.status(201).send(permission);
    } else {
        res.status(404).send("Permission not found :(");
    }
})

router.get('/', async (req, res, next) => {
    const payload = {
        page: req.query.page?.toString() || '1',
        pageSize: req.query.pageSize?.toString() || '10'
    };

    getPermissions(payload)
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Something went wrong');
        });
});

export default router;

