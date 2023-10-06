import express from "express";
import { creatOrganizationAdmin, deleteOrganizationAdmin, editOrganizationAdmin, getOrganizationAdmins } from "../controllers/organizationAdmin.js";

const router = express.Router();

router.post('/', (req, res, next) => {
    creatOrganizationAdmin(req.body).then(() => {
        res.status(201).send("Organization Admin created successfully!!")
    }).catch(err => {
        console.error(err);
        res.status(500).send(err);
    });
});

router.delete('/:id', async (req, res) => {
    const id = Number(req.params.id?.toString());

    deleteOrganizationAdmin(id)
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Something went wrong');
        });
});

router.put("/", async (req, res, next) => {
    editOrganizationAdmin(req.body).then(() => {
        res.status(201).send("Organization Admin edited successfully!!")
    }).catch(err => {
        console.error(err);
        res.status(500).send(err);
    });
});

router.get('/', async (req, res, next) => {
    const payload = {
        page: req.query.page?.toString() || '1',
        pageSize: req.query.pageSize?.toString() || '10',
        id: req.query.id?.toString() || '',
        name: req.query.name?.toString() || '',
        email: req.query.eamil?.toString() || '',
        organizationName: req.query.organizationName?.toString() || ''
    };

    getOrganizationAdmins(payload)
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Something went wrong');
        });
});



export default router;