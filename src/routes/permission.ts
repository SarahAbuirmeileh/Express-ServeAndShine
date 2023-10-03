import express from 'express';
import { createPermission, deletePermission, editPermission, getPermissions } from '../controllers/permission.js';
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

    deletePermission(id)
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Something went wrong');
        });
})

router.put("/", async (req, res, next) => {
    editPermission(req.body).then(() => {
        res.status(201).send("Permission edited successfully!!")
    }).catch(err => {
        console.error(err);
        res.status(500).send(err);
    });
});

// router.get("/:id", async (req, res) => {
//     const id = Number(req.params.id)

//     const permission = await getPermissionById({ id });
//     if (permission) {
//         res.status(201).send(permission);
//     } else {
//         res.status(404).send("Permission not found :(");
//     }
// })

router.get('/', async (req, res, next) => {
    const payload = {
        page: req.query.page?.toString() || '1',
        pageSize: req.query.pageSize?.toString() || '10',
        id: Number(req.query.id ) || 0,
        name: req.query.name?.toString() || "" 
    };

    console.log(req.query);
    

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

