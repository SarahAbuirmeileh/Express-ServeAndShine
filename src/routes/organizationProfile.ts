import express from "express";
import { createOrganizationProfile, deleteOrganizationProfile, editOrganizationProfile, getOrganizationProfile } from "../controllers/OrganizationProfile .js";
import { authorize, checkAdmin } from "../middleware/auth/authorize.js";
import { validateOrgId, validateOrganizationProfile } from "../middleware/validation/organizationProfile.js";
import { log } from "../controllers/logs.js";

const router = express.Router();

router.post('/', authorize("POST_organizationProfile"), validateOrganizationProfile, (req, res, next) => {
    createOrganizationProfile(req.body).then(() => {
        log({
            userId: res.locals.organizationAdmin.id,
            userName: res.locals.organizationAdmin.name,
            userType: 'admin',
            type: 'success',
            request: 'Create Organization Profile'
        }).then(() => {
            console.log('logged');
        }).catch(err => {
            console.log('NOT logged');
        })
        res.status(201).send("Organization Profile created successfully!!")
    }).catch(err => {
        log({
            userId: res.locals.organizationAdmin.id,
            userName: res.locals.organizationAdmin.name,
            userType: 'admin',
            type: 'failed',
            request: 'Create Organization Profile'
        }).then(() => {
            console.log('logged');
        }).catch(err => {
            console.log('NOT logged');
        })
        next(err);
    });
});

router.delete('/:id', validateOrgId, authorize("DELETE_organizationProfile"), async (req, res, next) => {
    const id = (req.params.id?.toString());

    deleteOrganizationProfile(id)
        .then(data => {
            log({
                userId: res.locals.organizationAdmin.id,
                userName: res.locals.organizationAdmin.name,
                userType: 'admin',
                type: 'success',
                request: 'Delete Organization Profile'
            }).then(() => {
                console.log('logged');
            }).catch(err => {
                console.log('NOT logged');
            })
            res.send(data);
        })
        .catch(err => {
            log({
                userId: res.locals.organizationAdmin.id,
                userName: res.locals.organizationAdmin.name,
                userType: 'admin',
                type: 'failed',
                request: 'Delete Organization Profile'
            }).then(() => {
                console.log('logged');
            }).catch(err => {
                console.log('NOT logged');
            })
            next(err);
        });
});

router.put("/:id", validateOrgId, authorize("PUT_organizationProfile"), async (req, res, next) => {
    editOrganizationProfile(req.body).then(() => {
        log({
            userId: res.locals.organizationAdmin.id,
            userName: res.locals.organizationAdmin.name,
            userType: 'admin',
            type: 'success',
            request: 'Edit Organization Profile'
        }).then(() => {
            console.log('logged');
        }).catch(err => {
            console.log('NOT logged');
        })
        res.status(201).send("Organization Profile edited successfully!!")
    }).catch(err => {
        log({
            userId: res.locals.organizationAdmin.id,
            userName: res.locals.organizationAdmin.name,
            userType: 'admin',
            type: 'failed',
            request: 'Edit Organization Profile'
        }).then(() => {
            console.log('logged');
        }).catch(err => {
            console.log('NOT logged');
        })
        next(err);
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
            log({
                userId: res.locals.organizationAdmin.id,
                userName: res.locals.organizationAdmin.name,
                userType: 'admin',
                type: 'success',
                request: 'Get Organization Profiles'
            }).then(() => {
                console.log('logged');
            }).catch(err => {
                console.log('NOT logged');
            })
            res.send(data);
        })
        .catch(err => {
            log({
                userId: res.locals.organizationAdmin.id,
                userName: res.locals.organizationAdmin.name,
                userType: 'admin',
                type: 'failed',
                request: 'Get Organization Profiles'
            }).then(() => {
                console.log('logged');
            }).catch(err => {
                console.log('NOT logged');
            })
            next(err);
        });
});

export default router;