import express from 'express';
import { createVoluntaryWork, deleteVoluntaryWork, deregisterVoluntaryWork, editVoluntaryWork, generateCertificate, getImages, getVoluntaryWork, getVoluntaryWorks, getVoluntaryWorksForVolunteer, putFeedback, putRating, registerByOrganizationAdmin, registerByVolunteer } from '../controllers/voluntaryWork.js';
import { NSVolunteer } from '../../types/volunteer.js';
import { NSVoluntaryWork } from '../../types/voluntaryWork.js';
import { authorize, checkParticipation } from '../middleware/auth/authorize.js';
import { validateDeleteImage, validateEditedVoluntaryWork, validateVoluntaryWork, validateVoluntaryWorkId } from '../middleware/validation/voluntaryWork.js';
import { log } from '../controllers/dataBase-logger.js';
import { NSLogs } from '../../types/logs.js';
import { logToCloudWatch } from '../controllers/AWS-services/AWS-CloudWatch-logs.js';
import { deleteImage, putCertificateTemplate, putImages } from '../controllers/AWS-services/AWS-S3.js';
import { searchOrganizationProfile } from '../controllers/OrganizationProfile .js';
import { validateVolunteerId } from '../middleware/validation/volunteer.js';

var router = express.Router();

router.post('/', authorize("POST_voluntaryWork"), validateVoluntaryWork, (req, res, next) => {
    createVoluntaryWork({ ...req.body, creatorId: res.locals.volunteer?.id || res.locals.organizationAdmin?.id }).then(() => {
        log({
            userId: res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
            userName: res.locals.organizationAdmin?.name || res.locals.volunteer?.name,
            userType: (res.locals.volunteer ? res.locals.volunteer?.type : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'success' as NSLogs.Type,
            request: 'Create Voluntary Work ' + req.body.name
        }).then().catch()

        logToCloudWatch(
            'success',
            'voluntary work',
            'Create Voluntary Work ' + req.body.name,
            res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
            res.locals.organizationAdmin?.name || res.locals.volunteer?.name
        ).then().catch()

        res.status(201).send("Voluntary work created successfully!!")
    }).catch(err => {
        log({
            userId: res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
            userName: res.locals.organizationAdmin?.name || res.locals.volunteer?.name,
            userType: (res.locals.volunteer ? res.locals.volunteer?.type : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Create Voluntary Work ' + req.body.name
        }).then().catch()

        logToCloudWatch(
            'failed',
            'voluntary work',
            'Create Voluntary Work ' + req.body.name,
            res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
            res.locals.organizationAdmin?.name || res.locals.volunteer?.name
        ).then().catch()

        next(err);
    });
});

router.delete('/:id', validateVoluntaryWorkId, authorize("DELETE_voluntaryWork"), async (req, res, next) => {
    const id = Number(req.params.id?.toString());

    deleteVoluntaryWork(id)
        .then(data => {
            log({
                userId: res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
                userName: res.locals.organizationAdmin?.name || res.locals.volunteer?.name,
                userType: (res.locals.volunteer ? res.locals.volunteer?.type : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
                type: 'success' as NSLogs.Type,
                request: 'Delete Voluntary Work with id: ' + id
            }).then().catch()

            logToCloudWatch(
                'success',
                'voluntary work',
                'Delete Voluntary Work with id: ' + id,
                res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
                res.locals.organizationAdmin?.name || res.locals.volunteer?.name
            ).then().catch()

            res.send(data);
        })
        .catch(err => {
            log({
                userId: res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
                userName: res.locals.organizationAdmin?.name || res.locals.volunteer?.name,
                userType: (res.locals.volunteer ? res.locals.volunteer?.type : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
                type: 'failed' as NSLogs.Type,
                request: 'Delete Voluntary Work with id: ' + id
            }).then().catch()

            logToCloudWatch(
                'failed',
                'voluntary work',
                'Delete Voluntary Work with id: ' + id,
                res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
                res.locals.organizationAdmin?.name || res.locals.volunteer?.name
            ).then().catch()

            next(err);
        });
})

router.delete('/image/:id', validateVoluntaryWorkId, authorize("DELETE_voluntaryWork"), validateDeleteImage, async (req, res, next) => {

    const id = Number(req.params.id?.toString());
    const voluntaryWork = await getVoluntaryWork({ id });
    const key = `${req.body.organizationName}/${voluntaryWork?.name}/${req.body.imageName}.png`

    deleteImage(key)
        .then(data => {
            log({
                userId: res.locals.organizationAdmin?.id,
                userName: res.locals.organizationAdmin?.name,
                userType: (res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
                type: 'success' as NSLogs.Type,
                request: 'Delete image from Voluntary Work with id: ' + id
            }).then().catch()

            logToCloudWatch(
                'success',
                'voluntary work',
                'Delete image from Voluntary Work with id: ' + id,
                res.locals.organizationAdmin?.id,
                res.locals.organizationAdmin?.name
            ).then().catch()

            res.send(data);
        })
        .catch(err => {
            log({
                userId: res.locals.organizationAdmin?.id,
                userName: res.locals.organizationAdmin?.name,
                userType: (res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
                type: 'failed' as NSLogs.Type,
                request: 'Delete image from Voluntary Work with id: ' + id
            }).then().catch()

            logToCloudWatch(
                'failed',
                'voluntary work',
                'Delete image from Voluntary Work with id: ' + id,
                res.locals.organizationAdmin?.id,
                res.locals.organizationAdmin?.name
            ).then().catch()

            next(err);
        });
})

router.put("/:id", authorize("PUT_voluntaryWork"), validateEditedVoluntaryWork, async (req, res, next) => {
    editVoluntaryWork({ ...req.body, id: req.params.id?.toString() }).then(() => {
        log({
            userId: res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
            userName: res.locals.organizationAdmin?.name || res.locals.volunteer?.name,
            userType: (res.locals.volunteer ? res.locals.volunteer?.type : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'success' as NSLogs.Type,
            request: 'Edit Voluntary Work with id: ' + req.params.id
        }).then().catch()

        logToCloudWatch(
            'success',
            'voluntary work',
            'Edit Voluntary Work with id: ' + req.params.id,
            res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
            res.locals.organizationAdmin?.name || res.locals.volunteer?.name
        ).then().catch()

        res.status(201).send("Voluntary Work edited successfully!!")
    }).catch(err => {
        log({
            userId: res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
            userName: res.locals.organizationAdmin?.name || res.locals.volunteer?.name,
            userType: (res.locals.volunteer ? res.locals.volunteer?.type : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Edit Voluntary Work with id: ' + req.params.id
        }).then().catch()

        logToCloudWatch(
            'failed',
            'voluntary work',
            'Edit Voluntary Work with id: ' + req.params.id,
            res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
            res.locals.organizationAdmin?.name || res.locals.volunteer?.name
        ).then().catch()

        next(err);
    });
});

router.get('/search', authorize("GET_voluntaryWorks"), async (req, res, next) => {

    const payload = {
        page: req.query.page?.toString() || '1',
        pageSize: req.query.pageSize?.toString() || '10',
        id: Number(req.query.id) || 0,
        name: req.query.name?.toString() || '',
        time: ((Array.isArray(req.query.time) ? req.query.time : [req.query.time]).filter(Boolean)) as NSVolunteer.AvailableTime[],
        location: (typeof req.query.location === 'string' ? req.query.location : ''),
        days: (Array.isArray(req.query.days) ? req.query.days : [req.query.days]).filter(Boolean) as NSVolunteer.AvailableDays[],
        rating: Number(req.query.rating) || 0,
        status: req.query.status as NSVoluntaryWork.StatusType,
        skills: (Array.isArray(req.query.skills) ? req.query.skills : [req.query.skills]).filter(Boolean) as string[],
        startedDate: req.query.startedDate?.toString() || "",
        finishedDate: req.query.finishedDate?.toString() || "",
        capacity: Number(req.query.capacity) || 0,
        finishedAfter: "",
        finishedBefore: "",
        startedAfter: "",
        startedBefore: "",
        ratingMore: Number(req.query.ratingMore) || 0,
        ratingLess: Number(req.query.ratingLess) || 0,
        creatorId: ""
    };

    getVoluntaryWorks(payload)
        .then(data => {
            log({
                userId: res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
                userName: res.locals.organizationAdmin?.name || res.locals.volunteer?.name,
                userType: (res.locals.volunteer ? res.locals.volunteer?.type : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
                type: 'success' as NSLogs.Type,
                request: 'Search Voluntary Work/s'
            }).then().catch()

            logToCloudWatch(
                'success',
                'voluntary work',
                'Search Voluntary Work/s',
                res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
                res.locals.organizationAdmin?.name || res.locals.volunteer?.name
            ).then().catch()

            res.send(data);
        })
        .catch(err => {
            log({
                userId: res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
                userName: res.locals.organizationAdmin?.name || res.locals.volunteer?.name,
                userType: (res.locals.volunteer ? res.locals.volunteer?.type : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
                type: 'failed' as NSLogs.Type,
                request: 'Search Voluntary Work/s'
            }).then().catch()

            logToCloudWatch(
                'failed',
                'voluntary work',
                'Search Voluntary Work/s',
                res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
                res.locals.organizationAdmin?.name || res.locals.volunteer?.name
            ).then().catch()

            next(err);
        });
});

router.get('/analysis', authorize("GET_analysis"), async (req, res, next) => {

    const payload = {
        page: req.query.page?.toString() || '1',
        pageSize: req.query.pageSize?.toString() || '10',
        id: Number(req.query.id) || 0,
        name: req.query.name?.toString() || '',
        time: ((Array.isArray(req.query.time) ? req.query.time : [req.query.time]).filter(Boolean)) as NSVolunteer.AvailableTime[],
        location: (typeof req.query.location === 'string' ? req.query.location : ''),
        days: (Array.isArray(req.query.days) ? req.query.days : [req.query.days]).filter(Boolean) as NSVolunteer.AvailableDays[],
        rating: Number(req.query.rating) || 0,
        status: req.query.status as NSVoluntaryWork.StatusType,
        skills: (Array.isArray(req.query.skills) ? req.query.skills : [req.query.skills]).filter(Boolean) as string[],
        startedDate: req.query.startedDate?.toString() || "",
        finishedDate: req.query.finishedDate?.toString() || "",
        capacity: Number(req.query.capacity) || 0,
        finishedAfter: req.query.finishedDate?.toString() || "",
        finishedBefore: req.query.finishedBefore?.toString() || "",
        startedAfter: req.query.startedAfter?.toString() || "",
        startedBefore: req.query.startedBefore?.toString() || "",
        ratingMore: Number(req.query.ratingMore) || 0,
        ratingLess: Number(req.query.ratingLess) || 0,
        creatorId: req.query.creatorId?.toString() || ""
    };

    getVoluntaryWorks(payload)
        .then(data => {
            log({
                userId: res.locals.organizationAdmin?.id,
                userName: res.locals.organizationAdmin?.name,
                userType: 'root' as NSLogs.userType,
                type: 'success' as NSLogs.Type,
                request: 'Analysis Voluntary Work/s'
            }).then().catch()

            logToCloudWatch(
                'success',
                'voluntary work',
                'Analysis Voluntary Work/s',
                res.locals.organizationAdmin?.id,
                res.locals.organizationAdmin?.name
            ).then().catch()

            res.send(data);
        })
        .catch(err => {
            log({
                userId: res.locals.organizationAdmin?.id,
                userName: res.locals.organizationAdmin?.name,
                userType: "root" as NSLogs.userType,
                type: 'failed' as NSLogs.Type,
                request: 'Analysis Voluntary Work/s'
            }).then().catch()

            logToCloudWatch(
                'failed',
                'voluntary work',
                'Analysis Voluntary Work/s',
                res.locals.organizationAdmin?.id,
                res.locals.organizationAdmin?.name
            ).then().catch()

            next(err);
        });
});

router.get('/recommendation', authorize("GET_recommendation"), async (req, res, next) => {
    const payload = { ...res.locals.volunteer };
    getVoluntaryWorks(payload)
        .then(data => {
            log({
                userId: res.locals.volunteer?.id,
                userName: res.locals.volunteer?.name,
                userType: res.locals.volunteer?.type as NSLogs.userType,
                type: 'success' as NSLogs.Type,
                request: 'Get recommendation'
            }).then().catch()

            logToCloudWatch(
                'success',
                'voluntary work',
                'Get recommendation',
                res.locals.volunteer?.id,
                res.locals.volunteer?.name
            ).then().catch()

            res.send(data);
        })
        .catch(err => {
            log({
                userId: res.locals.volunteer?.id,
                userName: res.locals.volunteer?.name,
                userType: res.locals.volunteer?.type as NSLogs.userType,
                type: 'failed' as NSLogs.Type,
                request: 'Get recommendation'
            }).then().catch()

            logToCloudWatch(
                'failed',
                'voluntary work',
                'Get recommendation',
                res.locals.volunteer?.id,
                res.locals.volunteer?.name
            ).then().catch()

            next(err);
        });
});

router.get('/image/:id', validateVoluntaryWorkId, async (req, res, next) => {
    getImages(Number(req.params.id))
        .then(data => {
            log({
                userId: res.locals.volunteer?.id || res.locals.organizationAdmin?.id,
                userName: res.locals.volunteer?.name || res.locals.organizationAdmin?.name,
                userType: res.locals.volunteer?.type as NSLogs.userType,
                type: 'success' as NSLogs.Type,
                request: 'Get image/s for voluntary work with id: ' + req.params.id
            }).then().catch()

            logToCloudWatch(
                'success',
                'voluntary work',
                'Get image/s',
                res.locals.volunteer?.id || res.locals.organizationAdmin?.id,
                res.locals.volunteer?.name || res.locals.organizationAdmin?.name
            ).then().catch()

            res.send(data);
        })
        .catch(err => {
            log({
                userId: res.locals.volunteer?.id || res.locals.organizationAdmin?.id,
                userName: res.locals.volunteer?.name || res.locals.organizationAdmin?.name,
                userType: res.locals.volunteer?.type as NSLogs.userType,
                type: 'failed' as NSLogs.Type,
                request: 'Get image/s for voluntary work with id: ' + req.params.id
            }).then().catch()

            logToCloudWatch(
                'failed',
                'voluntary work',
                'Get image/s',
                res.locals.volunteer?.id || res.locals.organizationAdmin?.id,
                res.locals.volunteer?.name || res.locals.organizationAdmin?.name
            ).then().catch()

            next(err);
        });
});

router.get('/volunteer/:id', validateVolunteerId, async (req, res, next) => {
    getVoluntaryWorksForVolunteer(req.params.id)
        .then(data => {
            log({
                userId: res.locals.volunteer?.id || res.locals.organizationAdmin?.id,
                userName: res.locals.volunteer?.name || res.locals.organizationAdmin?.name,
                userType: res.locals.volunteer?.type as NSLogs.userType,
                type: 'success' as NSLogs.Type,
                request: 'Get voluntary works for volunteer with id: ' + req.params.id
            }).then().catch()

            logToCloudWatch(
                'success',
                'voluntary work',
                'Get voluntary works for volunteer',
                res.locals.volunteer?.id || res.locals.organizationAdmin?.id,
                res.locals.volunteer?.name || res.locals.organizationAdmin?.name
            ).then().catch()

            res.send(data);
        })
        .catch(err => {
            log({
                userId: res.locals.volunteer?.id || res.locals.organizationAdmin?.id,
                userName: res.locals.volunteer?.name || res.locals.organizationAdmin?.name,
                userType: res.locals.volunteer?.type as NSLogs.userType,
                type: 'failed' as NSLogs.Type,
                request: 'Get voluntary works for volunteer with id: ' + req.params.id
            }).then().catch()

            logToCloudWatch(
                'failed',
                'voluntary work',
                'Get voluntary works for volunteer',
                res.locals.volunteer?.id || res.locals.organizationAdmin?.id,
                res.locals.volunteer?.name || res.locals.organizationAdmin?.name
            ).then().catch()

            next(err);
        });
});

router.put("/rating/:id", validateVoluntaryWorkId, authorize("PUT_rating"), checkParticipation, async (req, res, next) => {
    putRating(Number(req.params.id), Number(req.body.rating)).then(() => {
        log({
            userId: res.locals.volunteer?.id,
            userName: res.locals.volunteer?.name,
            userType: res.locals.volunteer?.type as NSLogs.userType,
            type: 'success' as NSLogs.Type,
            request: 'Add Rating to voluntary work with id' + req.params.id
        }).then().catch()

        logToCloudWatch(
            'success',
            'voluntary work',
            'Add Rating to voluntary work with id' + req.params.id,
            res.locals.volunteer?.id,
            res.locals.volunteer?.name
        ).then().catch()

        res.status(201).send("Rating added successfully!!")
    }).catch(err => {
        log({
            userId: res.locals.volunteer?.id,
            userName: res.locals.volunteer?.name,
            userType: res.locals.volunteer?.type as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Add Rating to voluntary work with id' + req.params.id
        }).then().catch()

        logToCloudWatch(
            'failed',
            'voluntary work',
            'Add Rating to voluntary work with id' + req.params.id,
            res.locals.volunteer?.id,
            res.locals.volunteer?.name
        ).then().catch()

        next(err);
    });
});

router.put("/feedback/:id", validateVoluntaryWorkId, authorize("PUT_feedback"), checkParticipation, async (req, res, next) => {
    putFeedback(Number(req.params.id), req.body.feedback).then(() => {
        log({
            userId: res.locals.volunteer?.id,
            userName: res.locals.volunteer?.name,
            userType: res.locals.volunteer?.type as NSLogs.userType,
            type: 'success' as NSLogs.Type,
            request: 'Add feedback to voluntary work with id' + req.params.id
        }).then().catch()

        logToCloudWatch(
            'success',
            'voluntary work',
            'Add feedback to voluntary work with id' + req.params.id,
            res.locals.volunteer?.id,
            res.locals.volunteer?.name
        ).then().catch()

        res.status(201).send("Feedback added successfully!!")
    }).catch(err => {
        log({
            userId: res.locals.volunteer?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: res.locals.volunteer?.type as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Add feedback to voluntary work with id' + req.params.id
        }).then().catch()

        logToCloudWatch(
            'failed',
            'voluntary work',
            'Add feedback to voluntary work with id' + req.params.id,
            res.locals.volunteer?.id,
            res.locals.volunteer?.name
        ).then().catch()

        next(err);
    });
});

router.put("/images/:id", validateVoluntaryWorkId, authorize("PUT_images"), async (req, res, next) => {
    const images = req.files?.image;
    if (!images) {
        return res.status(400).send("No images provided.");
    }

    try {
        const uploadedFiles = Array.isArray(images) ? images : [images];

        const payload = { page: "", pageSize: "", id: "", name: "", adminName: res.locals.organizationAdmin.name };
        const organization = await searchOrganizationProfile(payload);
        const organizationName = organization?.name || '';

        await putImages(Number(req.params.id), uploadedFiles, organizationName);

        log({
            userId: res.locals.organizationAdmin?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: (res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'success' as NSLogs.Type,
            request: 'Add images to voluntary work with id ' + req.params.id
        }).then().catch()

        logToCloudWatch(
            'success',
            'voluntary work',
            'Add images to voluntary work with id ' + req.params.id,
            res.locals.organizationAdmin?.id,
            res.locals.organizationAdmin?.name
        ).then().catch()

        res.status(201).send("Images added successfully!!");
    } catch (err) {
        log({
            userId: res.locals.organizationAdmin?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: (res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Add images to voluntary work with id ' + req.params.id
        }).then().catch()

        logToCloudWatch(
            'failed',
            'voluntary work',
            'Add images to voluntary work with id ' + req.params.id,
            res.locals.organizationAdmin?.id,
            res.locals.organizationAdmin?.name
        ).then().catch()

        next(err);
    }
});

router.put("/register/:id", validateVoluntaryWorkId, authorize("REGISTER_voluntaryWork"), async (req, res, next) => {
    if (res.locals.volunteer) {
        registerByVolunteer(Number(req.params.id), res.locals.volunteer?.volunteerProfile).then(() => {
            log({
                userId: res.locals.volunteer?.id,
                userName: res.locals.volunteer?.name,
                userType: res.locals.volunteer?.type as NSLogs.userType,
                type: 'success' as NSLogs.Type,
                request: 'Register to voluntary work with id' + req.params.id
            }).then().catch()

            logToCloudWatch(
                'success',
                'voluntary work',
                'Register to voluntary work with id' + req.params.id,
                res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
                res.locals.organizationAdmin?.name || res.locals.volunteer?.name
            ).then().catch()

            res.status(201).send("Registration done successfully!!")
        }).catch(err => {
            log({
                userId: res.locals.volunteer?.id,
                userName: res.locals.volunteer?.name,
                userType: res.locals.volunteer?.type as NSLogs.userType,
                type: 'failed' as NSLogs.Type,
                request: 'Register to voluntary work with id' + req.params.id
            }).then().catch()

            logToCloudWatch(
                'failed',
                'voluntary work',
                'Register to voluntary work with id' + req.params.id,
                res.locals.volunteer?.id,
                res.locals.volunteer?.name
            ).then().catch()

            next(err);
        });
    } else if (res.locals.organizationAdmin) {
        if (!req.body.volunteerId.toString()) {
            res.status(400).send("volunteer id is required!");
        }
        registerByOrganizationAdmin(Number(req.params.id), req.body.volunteerId.toString()).then(() => {
            log({
                userId: res.locals.organizationAdmin?.id,
                userName: res.locals.organizationAdmin?.name,
                userType: (res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
                type: 'success' as NSLogs.Type,
                request: 'Register By Organization Admin to voluntary work with id' + req.params.id + " volunteer id: " + req.body.volunteerId.toString()
            }).then().catch()

            logToCloudWatch(
                'success',
                'voluntary work',
                'Register By Organization Admin to voluntary work with id' + req.params.id + " volunteer id: " + req.body.volunteerId.toString(),
                res.locals.organizationAdmin?.id,
                res.locals.organizationAdmin?.name
            ).then().catch()

            res.status(201).send("Registration done successfully!!")
        }).catch(err => {
            log({
                userId: res.locals.organizationAdmin?.id,
                userName: res.locals.organizationAdmin?.name,
                userType: (res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
                type: 'failed' as NSLogs.Type,
                request: 'Register By Organization Admin to voluntary work with id' + req.params.id + " volunteer id: " + req.body.volunteerId.toString()
            }).then().catch()

            logToCloudWatch(
                'failed',
                'voluntary work',
                'Register By Organization Admin to voluntary work with id' + req.params.id + " volunteer id: " + req.body.volunteerId.toString(),
                res.locals.organizationAdmin?.id,
                res.locals.organizationAdmin?.name
            ).then().catch()

            next(err);
        });
    }
});

router.put("/deregister/:id", validateVoluntaryWorkId, authorize("DEREGISTER_voluntaryWork"), async (req, res, next) => {
    deregisterVoluntaryWork(Number(req.params.id), res.locals.volunteer.id || req.body.volunteerId.toString()).then(() => {
        log({
            userId: res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
            userName: res.locals.organizationAdmin?.name || res.locals.volunteer?.name,
            userType: (res.locals.volunteer ? res.locals.volunteer?.type : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'success' as NSLogs.Type,
            request: 'Deregister to voluntary work with id' + req.params.id + " volunteer id: " + res.locals.volunteer?.id || req.body.volunteerId.toString()
        }).then().catch()

        logToCloudWatch(
            'success',
            'voluntary work',
            'Deregister to voluntary work with id' + req.params.id + " volunteer id: " + res.locals.volunteer?.id || req.body.volunteerId.toString(),
            res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
            res.locals.organizationAdmin?.name || res.locals.volunteer?.name
        ).then().catch()

        res.status(201).send("Deregistration done successfully!!")
    }).catch(err => {
        log({
            userId: res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
            userName: res.locals.organizationAdmin?.name || res.locals.volunteer?.name,
            userType: (res.locals.volunteer ? res.locals.volunteer?.type : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Deregister to voluntary work with id' + req.params.id + " volunteer id: " + res.locals.volunteer?.id || req.body.volunteerId.toString()
        }).then().catch()

        logToCloudWatch(
            'failed',
            'voluntary work',
            'Deregister to voluntary work with id' + req.params.id + " volunteer id: " + res.locals.volunteer?.id || req.body.volunteerId.toString(),
            res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
            res.locals.organizationAdmin?.name || res.locals.volunteer?.name
        ).then().catch()

        next(err);
    });
});

router.put("/template/:id", validateVoluntaryWorkId, authorize("PUT_images"), async (req, res, next) => {
    const templates = req.files?.template;
    if (!templates) {
        return res.status(400).send("No Template provided.");
    }

    const uploadedFiles = Array.isArray(templates) ? templates : [templates];

    const payload = { page: "", pageSize: "", id: "", name: "", adminName: res.locals.organizationAdmin.name };
    const organization = await searchOrganizationProfile(payload);
    const organizationName = organization?.name || '';

    await putCertificateTemplate(organizationName, uploadedFiles).then(() => {
        log({
            userId: res.locals.organizationAdmin?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: (res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'success' as NSLogs.Type,
            request: 'Template added successfully for organization: ' + organizationName
        }).then().catch()

        logToCloudWatch(
            'success',
            'voluntary work',
            'Template added successfully for organization: ' + organizationName,
            res.locals.organizationAdmin?.id,
            res.locals.organizationAdmin?.name
        ).then().catch()

        res.status(201).send("Template added successfully!!")

    }).catch((err) => {
        log({
            userId: res.locals.organizationAdmin?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: (res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'success' as NSLogs.Type,
            request: 'Adding template for organization: ' + organizationName
        }).then().catch()

        logToCloudWatch(
            'failed',
            'voluntary work',
            'Adding template for organization: ' + organizationName,
            res.locals.organizationAdmin?.id,
            res.locals.organizationAdmin?.name
        ).then().catch()

        next(err);
    })

});

router.post("/generate-certificate/:id", validateVoluntaryWorkId, authorize("PUT_images"), async (req, res, next) => {
    const currentDate = new Date();
    const date = `${currentDate.getDate()} ${currentDate.getMonth() + 1} ${currentDate.getFullYear()}`

    const payload = { page: "", pageSize: "", id: "", name: "", adminName: res.locals.organizationAdmin.name };
    const organization = await searchOrganizationProfile(payload);
    const organizationName = organization?.name || '';

    generateCertificate(Number(req.params.id), organizationName, req.body.date || date).then(() => {
        log({
            userId: res.locals.organizationAdmin?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: (res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'success' as NSLogs.Type,
            request: 'Certifications generated successfully for organization: ' + organizationName
        }).then().catch()

        logToCloudWatch(
            'success',
            'voluntary work',
            'Certifications generated successfully for organization: ' + organizationName,
            res.locals.organizationAdmin?.id,
            res.locals.organizationAdmin?.name
        ).then().catch()

        res.status(201).send("Template added successfully!!")

    }).catch((err) => {
        log({
            userId: res.locals.organizationAdmin?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: (res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'success' as NSLogs.Type,
            request: 'Generating certifications for organization: ' + organizationName
        }).then().catch()

        logToCloudWatch(
            'failed',
            'voluntary work',
            'Generating certifications for organization: ' + organizationName,
            res.locals.organizationAdmin?.id,
            res.locals.organizationAdmin?.name
        ).then().catch()

        next(err);
    })

});

export default router;