import express from "express";
import { createOrganizationAdmin, deleteOrganizationAdmin, editOrganizationAdmin, getOrganizationAdmins } from "../controllers/organizationAdmin.js";
import { authorize, checkMe } from "../middleware/auth/authorize.js";
import { validateAdminEdited, validateOrganizationAdmin } from "../middleware/validation/organizationAdmin.js";

const router = express.Router();

router.post('/', authorize("POST_organizationAdmin"), validateOrganizationAdmin, (req, res, next) => {
    createOrganizationAdmin(req.body).then(() => {
        res.status(201).send("Organization Admin created successfully!!")
    }).catch(err => {
        console.error(err);
        res.status(500).send(err);
    });
});

router.delete('/:id', authorize("DELETE_organizationAdmin"), checkMe, async (req, res) => {
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

router.put("/:id", authorize("PUT_organizationAdmin"), checkMe, validateAdminEdited,async (req, res, next) => {
    editOrganizationAdmin({ ...req.body, id: req.params.id }).then(() => {
        res.status(201).send("Organization Admin edited successfully!!")
    }).catch(err => {
        console.error(err);
        res.status(500).send(err);
    });
});

router.get('/', authorize("GET_organizationAdmins"), async (req, res, next) => {
    const payload = {
        page: req.query.page?.toString() || '1',
        pageSize: req.query.pageSize?.toString() || '10',
        id: req.query.id?.toString() || '',
        name: req.query.name?.toString() || '',
        email: req.query.email?.toString() || '',
        organizationName: req.query.organizationName?.toString() || ''
    };

    getOrganizationAdmins(payload)
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send(error);
        });
});



export default router;