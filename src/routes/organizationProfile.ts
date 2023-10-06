import express from "express";
import { createOrganizationProfile, deleteOrganizationProfile, editOrganizationProfile, getOrganizationProfile } from "../controllers/OrganizationProfile .js";
import { authorize, checkAdmin } from "../middleware/auth/authorize.js";
import { validateOrganizationProfile } from "../middleware/validation/organizationProfile.js";

const router = express.Router();

router.post('/', authorize("POST_organizationProfile"), validateOrganizationProfile, (req, res, next) => {
    createOrganizationProfile(req.body).then(() => {
        res.status(201).send("Organization Profile created successfully!!")
    }).catch(err => {
        console.error(err);
        res.status(500).send(err);
    });
});

router.delete('/:id', authorize("DELETE_organizationProfile"), checkAdmin, async (req, res) => {
    const id = Number(req.params.id?.toString());

    deleteOrganizationProfile(id)
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Something went wrong');
        });
});

router.put("/:id", authorize("PUT_organizationProfile"),checkAdmin, async (req, res, next) => {
    editOrganizationProfile(req.body).then(() => {
        res.status(201).send("Organization Profile edited successfully!!")
    }).catch(err => {
        console.error(err);
        res.status(500).send(err);
    });
});

router.get('/', authorize("GET_organizationProfiles"), async (req, res, next) => {
    const payload = {
        page: req.query.page?.toString() || '1',
        pageSize: req.query.pageSize?.toString() || '10',
        id: req.query.id?.toString() || '',
        name: req.query.name?.toString() || '',
        adminName: req.query.adminName?.toString() || ''
    };

    getOrganizationProfile(payload)
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Something went wrong');
        });
});



export default router;