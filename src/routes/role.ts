import express from 'express';
import { createRole, deleteRole, editRole, getRoles } from '../controllers/role.js';
import { NSRole } from '../../types/role.js';
import { authorize } from '../middleware/auth/authorize.js';
import { validateEditedRole, validateRole } from '../middleware/validation/role.js';

var router = express.Router();

router.post('/', authorize("POST_role"), validateRole, (req, res, next) => {
    createRole(req.body).then(() => {
        res.status(201).send("Role created successfully!!")
    }).catch(err => {
        // console.error(err);
        // res.status(500).send(err);
        next(err);
    });
});

router.delete('/:id', authorize("DELETE_role"), async (req, res, next) => {
    const id = Number(req.params.id?.toString());

    deleteRole(id)
        .then(data => {
            res.send("Deleted");
        })
        .catch(err => {
            // console.error(error);
            // res.status(500).send('Something went wrong');
            next(err);
        });
})

router.put("/:id", authorize("PUT_role"),validateEditedRole, async (req, res, next) => {
    editRole({ ...req.body, id: req.params.id?.toString() }).then(() => {
        res.status(201).send("Role edited successfully!!")
    }).catch(err => {
        // console.error(err);
        // res.status(500).send(err);
        next(err);
    });
});

router.get('/', authorize("DELETE_role"), async (req, res, next) => {
    const payload = {
        page: req.query.page?.toString() || '1',
        pageSize: req.query.pageSize?.toString() || '10',
        id: Number(req.query.id) || 0,
        name: req.query.name?.toString() as NSRole.Type
    };

    getRoles(payload)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            // console.error(error);
            // res.status(500).send('Something went wrong');
            next(err);
        });
});

export default router;

