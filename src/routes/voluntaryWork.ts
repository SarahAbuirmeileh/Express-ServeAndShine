import express from 'express';
import { createVoluntaryWork, deleteFeedback, deleteImage, deleteRating, deleteVoluntaryWork, deregisterVoluntaryWork, editVoluntaryWork, generateCertificate, getAnalysis, getFeedbackAndRating, getImages, getOrganizationAnalysis, getRecommendation, getVoluntaryWork, getVoluntaryWorks, getVoluntaryWorksForVolunteer, putFeedback, putRating, registerByOrganizationAdmin, registerByVolunteer, volunteerReminder } from '../controllers/voluntaryWork.js';
import { NSVolunteer } from '../../types/volunteer.js';
import { NSVoluntaryWork } from '../../types/voluntaryWork.js';
import { authorize, checkParticipation } from '../middleware/auth/authorize.js';
import { validateDeleteFromS3, validateEditedVoluntaryWork, validateVoluntaryWork, validateVoluntaryWorkId } from '../middleware/validation/voluntaryWork.js';
import { log } from '../controllers/dataBaseLogger.js';
import { NSLogs } from '../../types/logs.js';
import { logToCloudWatch } from '../controllers/AWSServices/CloudWatchLogs.js';
import { deleteFromS3, loadFromS3, putCertificateTemplate, putImages } from '../controllers/AWSServices/S3.js';
import { searchOrganizationProfile } from '../controllers/OrganizationProfile .js';
import { validateVolunteerId } from '../middleware/validation/volunteer.js';
import { sendEmail } from '../controllers/AWSServices/SES.js';
import { VoluntaryWork } from '../db/entities/VoluntaryWork.js';
import { Volunteer } from '../db/entities/Volunteer.js';
import { SkillTag } from '../db/entities/SkillTag.js';
import baseLogger from '../../logger.js';
import { validateOrgId, validateOrganizationProfile } from '../middleware/validation/organizationProfile.js';

var router = express.Router();

router.post('/', authorize("POST_voluntaryWork"), validateVoluntaryWork, (req, res, next) => {
    createVoluntaryWork({ ...req.body, creatorId: res.locals.volunteer?.id || res.locals.organizationAdmin?.id }).then((data) => {
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

        res.status(201).send({ message: "Voluntary work created successfully!!", data })
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

router.post("/rating/:id", validateVoluntaryWorkId, authorize("DELETE_voluntaryWork"), async (req, res, next) => {
    volunteerReminder(Number(req.params.id)).then(() => {
        log({
            userId: res.locals.organizationAdmin?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: (res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'success' as NSLogs.Type,
            request: 'Reminder to add rating and feedback for voluntary work with id: ' + req.params.id,

        }).then().catch()

        logToCloudWatch(
            'success',
            'voluntary work',
            'Reminder to add rating and feedback for voluntary work with id: ' + req.params.id,
            res.locals.organizationAdmin?.id,
            res.locals.organizationAdmin?.name
        ).then().catch()

        res.status(201).send("Create remainder for rate and feedback  successfully!!")
    }).catch(err => {
        log({
            userId: res.locals.organizationAdmin?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: (res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Reminder to add rating and feedback for voluntary work with id: ' + req.params.id
        }).then().catch()

        logToCloudWatch(
            'failed',
            'voluntary work',
            'Reminder to add rating and feedback for voluntary work with id: ' + req.params.id,
            res.locals.organizationAdmin?.id,
            res.locals.organizationAdmin?.name
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

router.delete('/image/:id', validateVoluntaryWorkId, authorize("PUT_images"), validateDeleteFromS3, async (req, res, next) => {

    const id = Number(req.params.id?.toString());
    const voluntaryWork = await getVoluntaryWork({ id });
    const organizationProfile = await searchOrganizationProfile({ page: "", pageSize: "", id: "", name: "", adminName: res.locals.organizationAdmin.name });
    const key = `${organizationProfile?.name || req.body.organizationName}/${voluntaryWork?.name}/${req.body.imageName}.png`

    deleteImage(id, req.body.imageName + '.png').then(() => {
        deleteFromS3(key, 'image')
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

                res.status(200).send(data);
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

    }).catch(err => {
        baseLogger.error(err);
        next(err);
    })


})

router.delete('/certificate/:id', validateVoluntaryWorkId, authorize("DELETE_voluntaryWork"), validateDeleteFromS3, async (req, res, next) => {
    const id = Number(req.params.id?.toString());
    const voluntaryWork = await getVoluntaryWork({ id });
    const organizationProfile = await searchOrganizationProfile({ page: "", pageSize: "", id: "", name: "", adminName: res.locals.organizationAdmin.name });
    const key = `certificates/${organizationProfile?.name || req.body.organizationName}/${voluntaryWork?.name}/${req.body.imageName}.pdf`

    deleteFromS3(key, "certificate")
        .then(data => {
            log({
                userId: res.locals.organizationAdmin?.id,
                userName: res.locals.organizationAdmin?.name,
                userType: (res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
                type: 'success' as NSLogs.Type,
                request: 'Delete certificate for volunteer: ' + req.body.volunteerName
            }).then().catch()

            logToCloudWatch(
                'success',
                'voluntary work',
                'Delete certificate for volunteer: ' + req.body.volunteerName,
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
                request: 'Delete image for volunteer: ' + req.body.volunteerName
            }).then().catch()

            logToCloudWatch(
                'failed',
                'voluntary work',
                'Delete image for volunteer: ' + req.body.volunteerName,
                res.locals.organizationAdmin?.id,
                res.locals.organizationAdmin?.name
            ).then().catch()

            next(err);
        });
})

router.delete('/template/:id', validateOrganizationProfile, authorize("DELETE_voluntaryWork"), validateDeleteFromS3, async (req, res, next) => {

    const id = (req.params.id?.toString());
    const organizationProfile = await searchOrganizationProfile({ page: "", pageSize: "", id, name: "", adminName: '' });
    const key = `templates/${organizationProfile?.name}/${req.body.imageName || "certificate_template"}.html`

    deleteFromS3(key, "template")
        .then(data => {
            log({
                userId: res.locals.organizationAdmin?.id,
                userName: res.locals.organizationAdmin?.name,
                userType: (res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
                type: 'success' as NSLogs.Type,
                request: 'Delete template for organization :' + req.body.organizationName
            }).then().catch()

            logToCloudWatch(
                'success',
                'voluntary work',
                'Delete template for organization :' + req.body.organizationName,
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
                request: 'Delete template for organization :' + req.body.organizationName
            }).then().catch()

            logToCloudWatch(
                'failed',
                'voluntary work',
                'Delete template for organization :' + req.body.organizationName,
                res.locals.organizationAdmin?.id,
                res.locals.organizationAdmin?.name
            ).then().catch()

            next(err);
        });
})

router.delete("/rating/:id", validateVoluntaryWorkId, authorize("PUT_rating"), checkParticipation, async (req, res, next) => {
    deleteRating(Number(req.params.id), res.locals.volunteer?.name).then(() => {
        log({
            userId: res.locals.volunteer?.id,
            userName: res.locals.volunteer?.name,
            userType: res.locals.volunteer?.type as NSLogs.userType,
            type: 'success' as NSLogs.Type,
            request: 'Delete Rating to voluntary work with id' + req.params.id
        }).then().catch()

        logToCloudWatch(
            'success',
            'voluntary work',
            'Delete Rating to voluntary work with id' + req.params.id,
            res.locals.volunteer?.id,
            res.locals.volunteer?.name
        ).then().catch()

        res.status(200).send("Rating deleted successfully!!")
    }).catch(err => {
        log({
            userId: res.locals.volunteer?.id,
            userName: res.locals.volunteer?.name,
            userType: res.locals.volunteer?.type as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Delete Rating to voluntary work with id' + req.params.id
        }).then().catch()

        logToCloudWatch(
            'failed',
            'voluntary work',
            'Delete Rating to voluntary work with id' + req.params.id,
            res.locals.volunteer?.id,
            res.locals.volunteer?.name
        ).then().catch()

        next(err);
    });
});

router.delete("/feedback/:id", validateVoluntaryWorkId, authorize("PUT_rating"), checkParticipation, async (req, res, next) => {
    deleteFeedback(Number(req.params.id), res.locals.volunteer?.name).then(() => {
        log({
            userId: res.locals.volunteer?.id,
            userName: res.locals.volunteer?.name,
            userType: res.locals.volunteer?.type as NSLogs.userType,
            type: 'success' as NSLogs.Type,
            request: 'Delete Feedback to voluntary work with id' + req.params.id
        }).then().catch()

        logToCloudWatch(
            'success',
            'voluntary work',
            'Delete Feedback to voluntary work with id' + req.params.id,
            res.locals.volunteer?.id,
            res.locals.volunteer?.name
        ).then().catch()

        res.status(200).send("Feedback deleted successfully!!")
    }).catch(err => {
        log({
            userId: res.locals.volunteer?.id,
            userName: res.locals.volunteer?.name,
            userType: res.locals.volunteer?.type as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Delete Feedback to voluntary work with id' + req.params.id
        }).then().catch()

        logToCloudWatch(
            'failed',
            'voluntary work',
            'Delete Feedback to voluntary work with id' + req.params.id,
            res.locals.volunteer?.id,
            res.locals.volunteer?.name
        ).then().catch()

        next(err);
    });
});

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
        avgRating: Number(req.query.avgRating) || 0,
        status: req.query.status as NSVoluntaryWork.StatusType,
        skills: (Array.isArray(req.query.skills) ? req.query.skills : [req.query.skills]).filter(Boolean) as string[],
        startedDate: req.query.startedDate?.toString() || "",
        finishedDate: req.query.finishedDate?.toString() || "",
        capacity: Number(req.query.capacity) || 0,
        finishedAfter: "", finishedBefore: "",
        startedAfter: "", startedBefore: "", creatorId: "",
        avgRatingMore: Number(req.query.avgRatingMore) || 0,
        avgRatingLess: Number(req.query.avgRatingLess) || 0,
        isSkillsRequired: (req.query.startedDate?.toString() || false) as boolean
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

router.get('/advanced-search', authorize("GET_analysis"), async (req, res, next) => {

    const payload = {
        page: req.query.page?.toString() || '1',
        pageSize: req.query.pageSize?.toString() || '10',
        id: Number(req.query.id) || 0,
        name: req.query.name?.toString() || '',
        time: ((Array.isArray(req.query.time) ? req.query.time : [req.query.time]).filter(Boolean)) as NSVolunteer.AvailableTime[],
        location: (typeof req.query.location === 'string' ? req.query.location : ''),
        days: (Array.isArray(req.query.days) ? req.query.days : [req.query.days]).filter(Boolean) as NSVolunteer.AvailableDays[],
        avgRating: Number(req.query.avgRating) || 0,
        status: req.query.status as NSVoluntaryWork.StatusType,
        skills: (Array.isArray(req.query.skills) ? req.query.skills : [req.query.skills]).filter(Boolean) as string[],
        startedDate: req.query.startedDate?.toString() || "",
        finishedDate: req.query.finishedDate?.toString() || "",
        capacity: Number(req.query.capacity) || 0,
        finishedAfter: req.query.finishedDate?.toString() || "",
        finishedBefore: req.query.finishedBefore?.toString() || "",
        startedAfter: req.query.startedAfter?.toString() || "",
        startedBefore: req.query.startedBefore?.toString() || "",
        avgRatingMore: Number(req.query.avgRatingMore) || 0,
        avgRatingLess: Number(req.query.avgRatingLess) || 0,
        creatorId: req.query.creatorId?.toString() || "",
        isSkillsRequired: (req.query.startedDate?.toString() || false) as boolean
    };

    getVoluntaryWorks(payload)
        .then(data => {
            log({
                userId: res.locals.organizationAdmin?.id,
                userName: res.locals.organizationAdmin?.name,
                userType: 'root' as NSLogs.userType,
                type: 'success' as NSLogs.Type,
                request: 'Advanced search for Voluntary Work/s'
            }).then().catch()

            logToCloudWatch(
                'success',
                'voluntary work',
                'Advanced search for Voluntary Work/s',
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
                request: 'Advanced search for Voluntary Work/s'
            }).then().catch()

            logToCloudWatch(
                'failed',
                'voluntary work',
                'Advanced search for Voluntary Work/s',
                res.locals.organizationAdmin?.id,
                res.locals.organizationAdmin?.name
            ).then().catch()

            next(err);
        });
});

router.get('/analysis', authorize("GET_analysis"), async (req, res, next) => {
    getAnalysis()
        .then(data => {
            log({
                userId: res.locals.organizationAdmin?.id,
                userName: res.locals.organizationAdmin?.name,
                userType: 'root' as NSLogs.userType,
                type: 'success' as NSLogs.Type,
                request: 'Analyze the system '
            }).then().catch()

            logToCloudWatch(
                'success',
                'voluntary work',
                'Analyze the system ',
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
                request: 'Analyze the system '
            }).then().catch()

            logToCloudWatch(
                'failed',
                'voluntary work',
                'Analyze the system ',
                res.locals.organizationAdmin?.id,
                res.locals.organizationAdmin?.name
            ).then().catch()

            next(err);
        });
});

router.get('/analysis/:id', authorize("DELETE_organizationProfile"), validateOrgId, async (req, res, next) => {
    getOrganizationAnalysis(req.params.id.toString())
        .then(data => {
            log({
                userId: res.locals.organizationAdmin?.id,
                userName: res.locals.organizationAdmin?.name,
                userType: 'root' as NSLogs.userType,
                type: 'success' as NSLogs.Type,
                request: 'Analyze the organization voluntary works with id ' + req.params.id.toString()
            }).then().catch()

            logToCloudWatch(
                'success',
                'voluntary work',
                'Analyze the organization voluntary works ',
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
                request: 'Analyze the organization voluntary works with id ' + req.params.id.toString()
            }).then().catch()

            logToCloudWatch(
                'failed',
                'voluntary work',
                'Analyze the organization voluntary works ',
                res.locals.organizationAdmin?.id,
                res.locals.organizationAdmin?.name
            ).then().catch()

            next(err);
        });
});

router.get('/recommendation', authorize("GET_recommendation"), async (req, res, next) => {
    const skillTags: SkillTag[] = res.locals.volunteer.volunteerProfile.skillTags;
    const payload = {
        page: req.query.page?.toString() || '1',
        pageSize: req.query.pageSize?.toString() || '10',
        time: res.locals.volunteer.availableTime as NSVolunteer.AvailableTime[],
        location: res.locals.volunteer.availableLocation,
        days: res.locals.volunteer.availableDays as NSVolunteer.AvailableDays[],
        status: "Pending" as NSVoluntaryWork.StatusType,
        skillTags: skillTags.map(skillTag => skillTag.id)
    };

    getRecommendation(payload)
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
                userType: (res.locals.volunteer ? res.locals.volunteer?.type : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
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

router.get('/template/:id', authorize("PUT_images"), async (req, res, next) => {
    const payload = { page: '', pageSize: '', id: '', name: '', adminName: res.locals.organizationAdmin.name }
    const organizationProfile = await searchOrganizationProfile(payload);

    const prefix = `templates/${organizationProfile?.name || req.body.organizationName}`
    loadFromS3(process.env.AWS_CERTIFICATES_BUCKET_NAME || '', prefix)
        .then(data => {
            log({
                userId: res.locals.organizationAdmin?.id,
                userName: res.locals.organizationAdmin?.name,
                userType: (res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
                type: 'success' as NSLogs.Type,
                request: 'Get template/s for organization: ' + req.body.organizationName
            }).then().catch()

            logToCloudWatch(
                'success',
                'voluntary work',
                'Get template/s',
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
                request: 'Get template/s for organization: ' + req.body.organizationName
            }).then().catch()

            logToCloudWatch(
                'failed',
                'voluntary work',
                'Get template/s',
                res.locals.organizationAdmin?.id,
                res.locals.organizationAdmin?.name
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
                userType: (res.locals.volunteer ? res.locals.volunteer?.type : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
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
                userType: (res.locals.volunteer ? res.locals.volunteer?.type : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
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

router.get('/rating-and-feedback/:id', validateVoluntaryWorkId, async (req, res, next) => {
    getFeedbackAndRating(Number(req.params.id.toString()))
        .then(data => {
            log({
                userId: res.locals.volunteer?.id || res.locals.organizationAdmin?.id,
                userName: res.locals.volunteer?.name || res.locals.organizationAdmin?.name,
                userType: (res.locals.volunteer ? res.locals.volunteer?.type : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
                type: 'success' as NSLogs.Type,
                request: 'Get rating and feedback for  voluntary work with id: ' + req.params.id
            }).then().catch()

            logToCloudWatch(
                'success',
                'voluntary work',
                'Get rating and feedback for  voluntary work',
                res.locals.volunteer?.id || res.locals.organizationAdmin?.id,
                res.locals.volunteer?.name || res.locals.organizationAdmin?.name
            ).then().catch()

            res.send(data);
        })
        .catch(err => {
            log({
                userId: res.locals.volunteer?.id || res.locals.organizationAdmin?.id,
                userName: res.locals.volunteer?.name || res.locals.organizationAdmin?.name,
                userType: (res.locals.volunteer ? res.locals.volunteer?.type : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
                type: 'failed' as NSLogs.Type,
                request: 'Get rating and feedback for voluntary work with id: ' + req.params.id
            }).then().catch()

            logToCloudWatch(
                'failed',
                'voluntary work',
                'Get rating and feedback for  voluntary work',
                res.locals.volunteer?.id || res.locals.organizationAdmin?.id,
                res.locals.volunteer?.name || res.locals.organizationAdmin?.name
            ).then().catch()

            next(err);
        });
});


router.put("/rating/:id", validateVoluntaryWorkId, authorize("PUT_rating"), checkParticipation, async (req, res, next) => {
    putRating(Number(req.params.id), Number(req.body.rating), res.locals.volunteer?.name).then(() => {
        log({
            userId: res.locals.volunteer?.id,
            userName: res.locals.volunteer?.name,
            userType: res.locals.volunteer?.type as NSLogs.userType,
            type: 'success' as NSLogs.Type,
            request: 'Add or update Rating to voluntary work with id' + req.params.id
        }).then().catch()

        logToCloudWatch(
            'success',
            'voluntary work',
            'Add or update Rating to voluntary work with id' + req.params.id,
            res.locals.volunteer?.id,
            res.locals.volunteer?.name
        ).then().catch()

        res.status(201).send("Rating added or updated successfully!!")
    }).catch(err => {
        log({
            userId: res.locals.volunteer?.id,
            userName: res.locals.volunteer?.name,
            userType: res.locals.volunteer?.type as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Add or update Rating to voluntary work with id' + req.params.id
        }).then().catch()

        logToCloudWatch(
            'failed',
            'voluntary work',
            'Add or update Rating to voluntary work with id' + req.params.id,
            res.locals.volunteer?.id,
            res.locals.volunteer?.name
        ).then().catch()

        next(err);
    });
});

router.put("/feedback/:id", validateVoluntaryWorkId, authorize("PUT_feedback"), checkParticipation, async (req, res, next) => {
    putFeedback(Number(req.params.id), req.body.feedback, res.locals.volunteer?.name).then(() => {
        log({
            userId: res.locals.volunteer?.id,
            userName: res.locals.volunteer?.name,
            userType: res.locals.volunteer?.type as NSLogs.userType,
            type: 'success' as NSLogs.Type,
            request: 'Add or update feedback to voluntary work with id' + req.params.id
        }).then().catch()

        logToCloudWatch(
            'success',
            'voluntary work',
            'Add or update feedback to voluntary work with id' + req.params.id,
            res.locals.volunteer?.id,
            res.locals.volunteer?.name
        ).then().catch()

        res.status(201).send("Feedback or update added successfully!!")
    }).catch(err => {
        log({
            userId: res.locals.volunteer?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: res.locals.volunteer?.type as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Add or update feedback to voluntary work with id' + req.params.id
        }).then().catch()

        logToCloudWatch(
            'failed',
            'voluntary work',
            'Add or update feedback to voluntary work with id' + req.params.id,
            res.locals.volunteer?.id,
            res.locals.volunteer?.name
        ).then().catch()

        next(err);
    });
});

router.put("/image/:id", validateVoluntaryWorkId, authorize("PUT_images"), async (req, res, next) => {
    const images = req.files?.image;
    if (!images) {
        return res.status(400).send("No images provided.");
    }

    try {
        const uploadedFiles = Array.isArray(images) ? images : [images];

        const payload = { page: "", pageSize: "", id: "", name: "", adminName: res.locals.organizationAdmin.name };
        const organization = await searchOrganizationProfile(payload);
        const organizationName = organization?.name || req.body.organizationName;

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
    const voluntaryWork = await VoluntaryWork.findOne({ where: { id: Number(req.params.id) } })
    if (res.locals.volunteer) {
        registerByVolunteer(Number(req.params.id), res.locals.volunteer?.volunteerProfile).then(async () => {
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

            sendEmail(
                res.locals.volunteer.email,
                res.locals.volunteer.name,
                'Registration in Voluntary Work!',
                `You have successfully registered in ${voluntaryWork?.name}!`)

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
        const volunteer = await Volunteer.findOne({ where: { id: (req.body.volunteerId.toString()) } })
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

            if (volunteer) {
                sendEmail(
                    volunteer.email,
                    volunteer.name,
                    'Registration in Voluntary Work!',
                    `You have successfully registered in ${voluntaryWork?.name}!`)
            }

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
    const voluntaryWork = await VoluntaryWork.findOne({ where: { id: Number(req.params.id) } })
    const volunteer = await Volunteer.findOne({ where: { id: (req.body.volunteerId.toString()) } })

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

        sendEmail(
            res.locals.volunteer.email || volunteer?.email,
            res.locals.volunteer.name || volunteer?.name,
            'Deregistration from Voluntary Work!',
            `You have unfortunately deregistered from ${voluntaryWork?.name}. We hope to see you in other voluntary works!`)

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
    const organizationName = organization?.name || req.body.organizationName;

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

        res.status(201).send("Certifications generated and sent successfully!!")

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

/**
 * @swagger
 * tags:
 *   name: VoluntaryWork
 *   description: The voluntary work managing API
 */

/**
 * @swagger
 * /voluntaryWork:
 *   post:
 *     summary: Create a new voluntary work entry
 *     tags: [VoluntaryWork]
 *     requestBody:
 *       description: Data for creating a new voluntary work entry
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VoluntaryWorkRequest'
 *     responses:
 *       201:
 *         description: Voluntary work created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VoluntaryWorkResponse'
 *       400:
 *         description: Bad Request, validation failed
 *       401:
 *         description: You are unauthorized
 *       403:  
 *         description: You don't have the permission
 *       500:
 *         description: Something went wrong
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     VoluntaryWorkRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         location:
 *           type: string
 *         time:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Morning", "Afternoon"]
 *         status:
 *           type: string
 *           example: "Active"
 *         days:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Monday", "Wednesday"]
 *         startedDate:
 *           type: string
 *           format: date
 *         finishedDate:
 *           type: string
 *           format: date
 *         capacity:
 *           type: integer
 *         skillTagIds:
 *           type: array
 *           items:
 *             type: integer
 *       example:
 *         name: "Voluntary Work Name"
 *         description: "Description of the voluntary work"
 *         location: "Voluntary Work Location"
 *         time: ["Morning", "Afternoon"]
 *         status: "Active"
 *         days: ["Monday", "Wednesday"]
 *         startedDate: "2023-10-26"
 *         finishedDate: "2023-10-28"
 *         capacity: 10
 *         skillTagIds: [1, 2]
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     VoluntaryWorkRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         location:
 *           type: string
 *         time:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Morning", "Afternoon"]
 *         status:
 *           type: string
 *           example: "Active"
 *         days:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Monday", "Wednesday"]
 *         startedDate:
 *           type: string
 *           format: date
 *         finishedDate:
 *           type: string
 *           format: date
 *         capacity:
 *           type: integer
 *         skillTagIds:
 *           type: array
 *           items:
 *             type: integer
 *       example:
 *         name: "Voluntary Work Name"
 *         description: "Description of the voluntary work"
 *         location: "Voluntary Work Location"
 *         time: ["Morning", "Afternoon"]
 *         status: "Active"
 *         days: ["Monday", "Wednesday"]
 *         startedDate: "2023-10-26"
 *         finishedDate: "2023-10-28"
 *         capacity: 10
 *         skillTagIds: [1, 2]

 *     VoluntaryWorkResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *             startedDate:
 *               type: string
 *               format: date-time
 *             finishedDate:
 *               type: string
 *               format: date-time
 *             skillTagIds:
 *               type: array
 *               items:
 *                 type: integer
 *             feedback:
 *               type: array
 *               items:
 *                 type: object
 *             images:
 *               type: array
 *               items:
 *                 type: string
 *             description:
 *               type: string
 *             days:
 *               type: array
 *               items:
 *                 type: string
 *             time:
 *               type: array
 *               items:
 *                 type: string
 *             location:
 *               type: string
 *             rating:
 *               type: number
 *             capacity:
 *               type: integer
 *             creatorId:
 *               type: string
 *             skillTags:
 *               type: array
 *               items:
 *                 type: object
 *             volunteerProfiles:
 *               type: array
 *               items:
 *                 type: object
 *             orgProfiles:
 *               type: object
 *             createdAt:
 *               type: string
 *               format: date-time
 *       example:
 *         message: "Voluntary work created successfully!!"
 *         data:
 *           id: "auto generated"
 *           name: "Voluntary Work Name"
 *           startedDate: "2023-10-26T00:00:00.000Z"
 *           finishedDate: "2023-10-28T00:00:00.000Z"
 *           skillTagIds: [1, 2]
 *           feedback: []
 *           images: []
 *           description: "Description of the voluntary work"
 *           days: ["Monday", "Wednesday"]
 *           location: "Voluntary Work Location"
 *           rating: 0
 *           capacity: 10
 *           creatorId: "Your Creator ID"
 *           skillTags: []

 *           time: ["Morning", "Afternoon"]
 *           createdAt: "2023-10-26T00:00:00.000Z"
 */

/**
 * @swagger
 * /voluntaryWork/{id}:
 *   delete:
 *     summary: Delete a voluntary work entry by ID
 *     tags: [VoluntaryWork]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the voluntary work entry to delete
 *     responses:
 *       200:
 *         description: Voluntary work entry deleted successfully!
 *       401:
 *         description: You are unauthorized
 *       403:  
 *         description: You don't have the permission
 *       404:
 *         description: Voluntary work is not found.
 *       500:
 *         description: Something went wrong
 */

/**
 * @swagger
 * /voluntaryWork/rating/{id}:
 *   post:
 *     summary: Send reminders to volunteers for rating and feedback
 *     tags: [VoluntaryWork]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the voluntary work entry for which volunteers reminders should be sent
 *     responses:
 *       201:
 *         description: Create remainder for rate and feedback  successfully!!
 *       401:
 *         description: You are unauthorized
 *       403:  
 *         description: You don't have the permission
 *       404:
 *         description: Voluntary work is not found.
 *       500:
 *         description: Something went wrong
 */

/**
 * @swagger
 * /voluntaryWork/image/{id}:
 *   delete:
 *     summary: Delete an image associated with a voluntary work entry
 *     tags: [VoluntaryWork]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the voluntary work entry for which the image should be deleted
 *     requestBody:
 *       description: Data for deleting the image
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               organizationName:
 *                 type: string
 *                 description: The name of the organization (can be optional)
 *               imageName:
 *                 type: string
 *                 description: The name of the image to be deleted (without the file extension)
 *             required:
 *                - imageName
 *           example:
 *             organizationName: "Organization Name"
 *             imageName: "ImageName"
 *     responses:
 *       200:
 *         description: Image deleted successfully !
 *       401:
 *         description: You are unauthorized
 *       403:  
 *         description: You don't have the permission
 *       404:
 *         description: Voluntary work is not found
 *       500:
 *         description: Something went wrong
 */

/**
 * @swagger
 * /voluntaryWork/certificate/{id}:
 *   delete:
 *     summary: Delete a certificate associated with a voluntary work entry
 *     tags: [VoluntaryWork]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the voluntary work entry for which the certificate should be deleted
 *     requestBody:
 *       description: Data for deleting the certificate
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               organizationName:
 *                 type: string
 *               imageName:
 *                 type: string
 *               volunteerName:
 *                 type: string
 *             required:
 *               - imageName
 *               - volunteerName
 *           example:
 *             organizationName: "Organization Name"
 *             imageName: "CertificateName"
 *             volunteerName: "Volunteer Name"
 *     responses:
 *       200:
 *         description: Certificate deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Certificate deleted successfully"
 *               data: "Certificate deleted successfully!"
 *       400:
 *         description: Bad Request. Validation failed.
 *       401:
 *         description: You are unauthorized
 *       403:  
 *         description: You don't have the permission
 *       404:
 *         description: Voluntary work is not found.
 *       500:
 *         description: Something went wrong
 */

/**
 * @swagger
 * /voluntaryWork/template/{id}:
 *   delete:
 *     summary: Delete a template associated with an organization
 *     tags: [VoluntaryWork]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the organization to delete its template
 *     requestBody:
 *       description: Data for deleting the template
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imageName:
 *                 type: string
 *             required:
 *               - imageName
 *           example:
 *             imageName: "TemplateFileName"
 *     responses:
 *       200:
 *         description: Template deleted successfully
 *       401:
 *         description: You are unauthorized
 *       403:  
 *         description: You don't have the permission
 *       404:
 *         description: Organization is not found
 *       500:
 *         description: Something went wrong
 */

/**
 * @swagger
 * /voluntaryWork/{id}:
 *   put:
 *     summary: Update a voluntary work entry by ID
 *     tags: [VoluntaryWork]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the voluntary work entry to be updated
 *     requestBody:
 *       description: Data for updating the voluntary work entry
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               days:
 *                 type: array
 *                 items:
 *                   type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               time:
 *                 type: string
 *               status:
 *                 type: string
 *               skillTagIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *               startedDate:
 *                 type: string
 *               finishedDate:
 *                 type: string
 *             required:
 *                false
 *             example:
 *               name: "Updated Voluntary Work Name"
 *               description: "Updated description for the voluntary work"
 *               location: "Updated location"
 *               capacity: 50
 *               days: "Updated days"
 *               images: ["image1.jpg", "image2.jpg"]
 *               time: "Updated time"
 *               status: "Updated status"
 *               skillTagIds: [1, 2, 3]
 *               startedDate: "2023-10-31"
 *               finishedDate: "2023-11-30"
 *     responses:
 *       201:
 *         description: Voluntary work updated successfully
 *       400:
 *         description: Bad Request, validation failed
 *       401:
 *         description: You are unauthorized
 *       403:  
 *         description: You don't have the permission
 *       404:
 *         description: Organization is not found
 *       500:
 *         description: Something went wrong
 */

/**
 * @swagger
 * /voluntaryWork/search:
 *   get:
 *     summary: Search for voluntary work entries based on various filters
 *     tags: [VoluntaryWork]
 *     parameters:
 *       - in: query
 *         name: page
 *         description: Page number for pagination (default 1) 
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         description: Number of entries per page (default 10)
 *         schema:
 *           type: integer
 *       - in: query
 *         name: id
 *         description: ID of the voluntary work entry
 *         schema:
 *           type: integer
 *       - in: query
 *         name: name
 *         description: Name of the voluntary work entry
 *         schema:
 *           type: string
 *       - in: query
 *         name: time
 *         description: Available time for the voluntary work entry
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *       - in: query
 *         name: location
 *         description: Location of the voluntary work entry
 *         schema:
 *           type: string
 *       - in: query
 *         name: days
 *         description: Available days for the voluntary work entry
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *       - in: query
 *         name: rating
 *         description: Minimum rating for the voluntary work entry
 *         schema:
 *           type: number
 *       - in: query
 *         name: status
 *         description: Status of the voluntary work entry
 *         schema:
 *           type: string
 *       - in: query
 *         name: skills
 *         description: Skill tags associated with the voluntary work entry
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *       - in: query
 *         name: startedDate
 *         description: Voluntary work entry started date (e.g., "2023-10-31")
 *         schema:
 *           type: string
 *       - in: query
 *         name: finishedDate
 *         description: Voluntary work entry finished date (e.g., "2023-11-30")
 *         schema:
 *           type: string
 *       - in: query
 *         name: capacity
 *         description: Capacity of the voluntary work entry
 *         schema:
 *           type: integer
 *       - in: query
 *         name: ratingMore
 *         description: Filter for voluntary work entries with a rating greater than or equal to a specific value
 *         schema:
 *           type: number
 *       - in: query
 *         name: ratingLess
 *         description: Filter for voluntary work entries with a rating less than or equal to a specific value
 *         schema:
 *           type: number
 *       - in: query
 *         name: creatorId
 *         description: ID of the creator of the voluntary work entry
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful search for voluntary work entries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                 pageSize:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 voluntaryWorks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       days:
 *                         type: string
 *                       time:
 *                         type: string
 *                       location:
 *                         type: string
 *                       startedDate:
 *                         type: string
 *                       finishedDate:
 *                         type: string
 *                       status:
 *                         type: string
 *                       images:
 *                         type: array
 *                         items:
 *                           type: string
 *                       rating:
 *                         type: number
 *                       feedback:
 *                         type: string
 *                       capacity:
 *                         type: integer
 *                       skillTags:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                       volunteers:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                       volunteerNumbers:
 *                         type: integer
 *                       creatorId:
 *                         type: string
 *                       createdAt:
 *                         type: string
*                       required:
*                          false
 *       401:
 *         description: You are unauthorized
 *       403:
 *         description: You don't have the permission
 *       500:
 *         description: Something went wrong
 */

/**
 * @swagger
 * /voluntaryWork/advanced-search:
 *   get:
 *     summary: Advanced search with a lot of details for voluntary work entries based on various filters
 *     tags: [VoluntaryWork]
 *     parameters:
 *       - in: query
 *         name: page
 *         description: Page number for pagination (default 1)
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         description: Number of entries per page (default 10)
 *         schema:
 *           type: integer
 *       - in: query
 *         name: id
 *         description: ID of the voluntary work entry
 *         schema:
 *           type: integer
 *       - in: query
 *         name: name
 *         description: Name of the voluntary work entry
 *         schema:
 *           type: string
 *       - in: query
 *         name: time
 *         description: Available time for the voluntary work entry
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *       - in: query
 *         name: location
 *         description: Location of the voluntary work entry
 *         schema:
 *           type: string
 *       - in: query
 *         name: days
 *         description: Available days for the voluntary work entry
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *       - in: query
 *         name: rating
 *         description: Minimum rating for the voluntary work entry
 *         schema:
 *           type: number
 *       - in: query
 *         name: status
 *         description: Status of the voluntary work entry
 *         schema:
 *           type: string
 *       - in: query
 *         name: skills
 *         description: Skill tags associated with the voluntary work entry
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *       - in: query
 *         name: startedDate
 *         description: Voluntary work entry started date (e.g., "2023-10-31")
 *         schema:
 *           type: string
 *       - in: query
 *         name: finishedDate
 *         description: Voluntary work entry finished date (e.g., "2023-11-30")
 *         schema:
 *           type: string
 *       - in: query
 *         name: capacity
 *         description: Capacity of the voluntary work entry
 *         schema:
 *           type: integer
 *       - in: query
 *         name: finishedAfter
 *         description: Filter for voluntary work entries finished after a certain date
 *         schema:
 *           type: string
 *       - in: query
 *         name: finishedBefore
 *         description: Filter for voluntary work entries finished before a certain date
 *         schema:
 *           type: string
 *       - in: query
 *         name: startedAfter
 *         description: Filter for voluntary work entries started after a certain date
 *         schema:
 *           type: string
 *       - in: query
 *         name: startedBefore
 *         description: Filter for voluntary work entries started before a certain date
 *         schema:
 *           type: string
 *       - in: query
 *         name: ratingMore
 *         description: Filter for voluntary work entries with a rating greater than or equal to a specific value
 *         schema:
 *           type: number
 *       - in: query
 *         name: ratingLess
 *         description: Filter for voluntary work entries with a rating less than or equal to a specific value
 *         schema:
 *           type: number
 *       - in: query
 *         name: creatorId
 *         description: ID of the creator of the voluntary work entry
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful analysis and search for voluntary work entries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                 pageSize:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 voluntaryWorks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       days:
 *                         type: string
 *                       time:
 *                         type: string
 *                       location:
 *                         type: string
 *                       startedDate:
 *                         type: string
 *                       finishedDate:
 *                         type: string
 *                       status:
 *                         type: string
 *                       images:
 *                         type: array
 *                         items:
 *                           type: string
 *                       rating:
 *                         type: number
 *                       feedback:
 *                         type: string
 *                       capacity:
 *                         type: integer
 *                       skillTags:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                       volunteers:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                       volunteerNumbers:
 *                         type: integer
 *                       creatorId:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *       401:
 *         description: You are unauthorized
 *       403:
 *         description: You don't have the permission
 *       500:
 *         description: Something went wrong
 */

/**
 * @swagger
 * /voluntaryWork/recommendation:
 *   get:
 *     summary: Get voluntary work recommendations based on volunteer's information
 *     tags: [VoluntaryWork]
 *     parameters:
 *       - in: query
 *         name: page
 *         description: Page number for pagination (default 1)
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         description: Number of entries per page (default 10)
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successful retrieval of voluntary work recommendations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                 pageSize:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 voluntaryWorks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       days:
 *                         type: string
 *                       time:
 *                         type: string
 *                       location:
 *                         type: string
 *                       startedDate:
 *                         type: string
 *                       finishedDate:
 *                         type: string
 *                       status:
 *                         type: string
 *                       capacity:
 *                         type: integer
 *                       skillTags:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                       volunteers:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                       volunteerNumbers:
 *                         type: integer
 *                       createdAt:
 *                         type: string
 *       401:
 *         description: You are unauthorized
 *       403:
 *         description: You don't have the permission
 *       500:
 *         description: Something went wrong
 */

/**
 * @swagger
 * /voluntaryWork/image/{id}:
 *   get:
 *     summary: Get images associated with a voluntary work entry
 *     tags: [VoluntaryWork]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the voluntary work entry to retrieve images
 *     responses:
 *       200:
 *         description: Successful retrieval of images
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *                 format: uri
 *       401:
 *         description: Unauthorized. You do not have permission to access these images.
 *       403:
 *         description: You don't have the permission
 *       404:
 *         description: Voluntary work is not found.
 *       500:
 *         description: Something went wrong
 */

/**
 * @swagger
 * /voluntaryWork/template/{id}:
 *   get:
 *     summary: Get templates associated with an organization
 *     tags: [VoluntaryWork]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the organization to retrieve its templates
 *     responses:
 *       200:
 *         description: Successful retrieval of templates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *                 format: uri
 *       401:
 *         description: You are unauthorized
 *       403:
 *         description: You don't have the permission
 *       404:
 *         description: Organization not found.
 *       500:
 *         description: Something went wrong
 */

/**
 * @swagger
 * /voluntaryWork/volunteer/{id}:
 *   get:
 *     summary: Get voluntary works associated with a volunteer
 *     tags: [VoluntaryWork]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the volunteer to retrieve their associated voluntary works
 *     responses:
 *       200:
 *         description: Successful retrieval of voluntary works for the volunteer
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   days:
 *                     type: array
 *                     items:
 *                       type: string
 *                   time:
 *                     type: array
 *                     items:
 *                       type: string
 *                   location:
 *                     type: string
 *                   startedDate:
 *                     type: string
 *                   finishedDate:
 *                     type: string
 *                   status:
 *                     type: string
 *                   capacity:
 *                     type: integer
 *                   skillTags:
 *                     type: array
 *                     items:
 *                       type: string
 *                   volunteers:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                   volunteerNumbers:
 *                     type: integer
 *                   createdAt:
 *                     type: string
 *       401:
 *         description: You are unauthorized
 *       403:
 *         description: You don't have the permission
 *       404:
 *         description: Volunteer not found.
 *       500:
 *         description: Something went wrong
 */

/**
 * @swagger
 * /voluntaryWork/rating/{id}:
 *   put:
 *     summary: Add or update the rating for a voluntary work
 *     tags: [VoluntaryWork]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the voluntary work to add or update the rating
 *     requestBody:
 *       description: The rating to add or update for the voluntary work
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: number
 *           example:
 *             rating: 4
 *     responses:
 *       201:
 *         description: Rating added or updated successfully
 *       400:
 *         description: Bad Request, validation failed
 *       401:
 *         description: You are unauthorized
 *       403:
 *         description: You don't have the permission.
 *       404:
 *         description: Voluntary work not found.
 *       500:
 *         description: Something went wrong
 */

/**
 * @swagger
 * /voluntaryWork/feedback/{id}:
 *   put:
 *     summary: Add feedback to a voluntary work
 *     tags: [VoluntaryWork]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the voluntary work to add feedback
 *     requestBody:
 *       description: Feedback to add to the voluntary work
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: string
 *           example:
 *             feedback: "This voluntary work was a great experience!"
 *     responses:
 *       201:
 *         description: Feedback added successfully
 *       400:
 *         description: Bad Request, validation failed
 *       401:
 *         description: You are unauthorized
 *       403:
 *         description: You don't have the permission
 *       404:
 *         description: Voluntary work not found
 *       500:
 *         description: Something went wrong
 */

/**
 * @swagger
 * /voluntaryWork/image/{id}:
 *   put:
 *     summary: Add images to a voluntary work
 *     tags: [VoluntaryWork]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the voluntary work to add images
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: array 
 *                 items:
 *                   type: string
 *           example:
 *             image: [binary-data]
 *     responses:
 *       201:
 *         description: Images added successfully
 *       400:
 *         description: Bad Request, validation failed
 *       401:
 *         description: You are unauthorized
 *       403:
 *         description: You don't have the permission.
 *       404:
 *         description: Voluntary work not found.
 *       500:
 *         description: Something went wrong
 */

/**
 * @swagger
 * /voluntaryWork/register/{id}:
 *   put:
 *     summary: Register in voluntary work
 *     tags: [VoluntaryWork]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the voluntary work to register for
 *     requestBody:
 *       description: Registration request details
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               volunteerId:
 *                 type: string
 *           example:
 *             volunteerId: "12345"
 *     responses:
 *       201:
 *         description: Registration completed successfully
 *       400:
 *         description: Bad Request, validation failed
 *       401:
 *         description: You are unauthorized
 *       403:
 *         description: You don't have the permission.
 *       404:
 *         description: Voluntary work not found.
 *       500:
 *         description: Something went wrong
 */

/**
 * @swagger
 * /voluntaryWork/deregister/{id}:
 *   put:
 *     summary: Deregister from a voluntary work
 *     tags: [VoluntaryWork]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the voluntary work to deregister from
 *     requestBody:
 *       description: Deregistration request details
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               volunteerId:
 *                 type: string
 *           example:
 *             volunteerId: "12345"
 *     responses:
 *       201:
 *         description: Deregistration completed successfully
 *       400:
 *         description: Bad Request, validation failed
 *       401:
 *         description:  You are unauthorized
 *       403:
 *         description: You don't have the permission.
 *       404:
 *         description: Voluntary work or volunteer not found.
 *       500:
 *         description: Something went wrong
 */

/**
 * @swagger
 * /voluntaryWork/template/{id}:
 *   put:
 *     summary: Add a certificate template for an organization
 *     tags: [VoluntaryWork]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the organization for which to add a certificate template
 *     requestBody:
 *       description: Certificate template file to upload
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               template:
 *                 type: file
 *           example:
 *             template: certificate_template.html
 *     responses:
 *       201:
 *         description: Certificate template added successfully
 *       400:
 *         description: Bad Request, validation failed
 *       401:
 *         description: You are unauthorized
 *       403:
 *         description: You don't have the permission.
 *       500:
 *         description: Something went wrong
 */

/**
 * @swagger
 * /voluntaryWork/generate-certificate/{id}:
 *   post:
 *     summary: Generate certificates for a voluntary work and send them to volunteers
 *     tags: [VoluntaryWork]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the voluntary work for which to generate certificates
 *     requestBody:
 *       description: Request body to customize the certificates
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 description: Date to include on the certificates
 *           example:
 *             date: "2023-10-12"
 *     responses:
 *       201:
 *         description: Certificates generated and sent successfully
 *       400:
 *         description: Bad Request, validation failed
 *       401:
 *         description:  You are unauthorized
 *       403:
 *         description: You don't have the permission.
 *       500:
 *         description: Something went wrong
 */

/**
 * @swagger
 * /voluntaryWork/rating-and-feedback/{id}:
 *   get:
 *     summary: Get ratings and feedback for a voluntary work
 *     tags: [VoluntaryWork]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the voluntary work for which to get ratings and feedback
 *     responses:
 *       200:
 *         description: Ratings and feedback retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 avgRating:
 *                   type: number
 *                   description: Average rating for the voluntary work
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       volunteerName:
 *                         type: string
 *                         description: Name of the volunteer
 *                       rating:
 *                         type: number
 *                         description: Rating given by the volunteer
 *                       feedback:
 *                         type: string
 *                         description: Feedback provided by the volunteer
 *           example:
 *             avgRating: 4.5
 *             data:
 *               - volunteerName: "John Doe"
 *                 rating: 4
 *                 feedback: "Great experience!"
 *               - volunteerName: "Alice Smith"
 *                 rating: 5
 *                 feedback: "Wonderful opportunity!"
 *               - volunteerName: "Eve Johnson"
 *                 rating: 4
 *                 feedback: "Enjoyed the work but could be improved."

 *       404:
 *         description: Voluntary work not found.
 *       500:
 *         description: Something went wrong
 */

/**
 * @swagger
 * /voluntaryWork/rating/{id}:
 *   delete:
 *     summary: Delete a rating for a voluntary work
 *     tags: [VoluntaryWork]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the voluntary work from which to delete a rating
 *     responses:
 *       200:
 *         description: Rating deleted successfully
 *       401:
 *         description: You are unauthorized
 *       403:
 *         description:  You don't have the permission.
 *       404:
 *         description: Rating not found or Voluntary work not found.
 *       500:
 *         description: Something went wrong
 */

/**
 * @swagger
 * /voluntaryWork/feedback/{id}:
 *   delete:
 *     summary: Delete feedback for a voluntary work
 *     tags: [VoluntaryWork]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the voluntary work from which to delete feedback
 *     responses:
 *       200:
 *         description: Rating deleted successfully
 *       401:
 *         description: You are unauthorized
 *       403:
 *         description:  You don't have the permission.
 *       404:
 *         description: Feedback not found or Voluntary work not found.
 *       500:
 *         description: Something went wrong
 */

/**
 * @swagger
 * /voluntaryWork/analysis:
 *   get:
 *     summary: Get analysis of the voluntary work system
 *     tags: [VoluntaryWork]
 *     responses:
 *       200:
 *         description: Analysis of the voluntary work system
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 avgRating:
 *                   type: object
 *                   description: Distribution of average ratings.
 *                   example:
 *                     '0-1': 10,
 *                     '1-2': 20,
 *                     '2-3': 30,
 *                     '3-4': 40,
 *                     '4-5': 50
 *                 status:
 *                   type: object
 *                   description: Distribution of voluntary work statuses.
 *                   example:
 *                     'Pending': 5,
 *                     'In Progress': 10,
 *                     'Finished': 20,
 *                     'Canceled': 3
 *                 location:
 *                   type: object
 *                   description: Distribution of voluntary work locations.
 *                   example:
 *                     'Location A': 15,
 *                     'Location B': 25,
 *                     'Location C': 10
 *                 capacity:
 *                   type: object
 *                   description: Distribution of voluntary work capacities.
 *                   example:
 *                     20: 15,
 *                     30: 25,
 *                     40: 10
 *                 startedDates:
 *                   type: object
 *                   description: Distribution of when voluntary works were started.
 *                   example:
 *                     'Last Week': 5,
 *                     'Last Month': 10,
 *                     'Last Year': 20
 *                 finishedDates:
 *                   type: object
 *                   description: Distribution of when voluntary works were finished.
 *                   example:
 *                     'Last Week': 3,
 *                     'Last Month': 7,
 *                     'Last Year': 15
 *                 voluntaryWorkNumbers:
 *                   type: integer
 *                   description: Total number of voluntary works.
 *                   example: 100
 *       401:
 *         description: You are unauthorized
 *       403:
 *         description: You don't have the permission.
 *       500:
 *         description: Something went wrong
 */

/**
 * @swagger
 * /voluntaryWork/analysis/{id}:
 *   get:
 *     summary: Get analysis of an organization's voluntary works
 *     tags: [VoluntaryWork]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Organization ID
 *         schema:
 *           type: string
 *         example: "12345"
 *     responses:
 *       200:
 *         description: Analysis of the organization's voluntary works
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 voluntaryWorkNumbers:
 *                   type: integer
 *                   description: Total number of voluntary works within the organization.
 *                   example: 100
 *                 avgRating:
 *                   type: object
 *                   description: Distribution of average ratings within the organization's voluntary works.
 *                   example:
 *                     '0-1': 10,
 *                     '1-2': 20,
 *                     '2-3': 30,
 *                     '3-4': 40,
 *                     '4-5': 50
 *                 status:
 *                   type: object
 *                   description: Distribution of voluntary work statuses within the organization.
 *                   example:
 *                     'Pending': 5,
 *                     'In Progress': 10,
 *                     'Finished': 20,
 *                     'Canceled': 3
 *                 location:
 *                   type: object
 *                   description: Distribution of voluntary work locations within the organization.
 *                   example:
 *                     'Location A': 15,
 *                     'Location B': 25,
 *                     'Location C': 10
 *                 capacity:
 *                   type: object
 *                   description: Distribution of voluntary work capacities within the organization.
 *                   example:
 *                     20: 15,
 *                     30: 25,
 *                     40: 10
 *                 startedDates:
 *                   type: object
 *                   description: Distribution of when voluntary works were started within the organization.
 *                   example:
 *                     'Last Week': 5,
 *                     'Last Month': 10,
 *                     'Last Year': 20
 *                 finishedDates:
 *                   type: object
 *                   description: Distribution of when voluntary works were finished within the organization.
 *                   example:
 *                     'Last Week': 3,
 *                     'Last Month': 7,
 *                     'Last Year': 15
 *       401:
 *         description: You are unauthorized.
 *       403:
 *         description: You don't have the permission.
 *       500:
 *         description: Something went wrong
 */

