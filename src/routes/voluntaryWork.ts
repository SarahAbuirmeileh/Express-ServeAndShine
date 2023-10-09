import express from 'express';
import { createVoluntaryWork, deleteVoluntaryWork, deregisterVoluntaryWork, editVoluntaryWork, getVoluntaryWork, getVoluntaryWorks, putFeedback, putImages, putRating, registerByOrganizationAdmin, registerByVolunteer } from '../controllers/voluntaryWork.js';
import { NSVolunteer } from '../../types/volunteer.js';
import { NSVoluntaryWork } from '../../types/voluntaryWork.js';
import { authorize, checkParticipation } from '../middleware/auth/authorize.js';
import { validateEditedVoluntaryWork, validateVoluntaryWork, validateVoluntaryWorkId } from '../middleware/validation/voluntaryWork.js';
import { UploadedFile } from 'express-fileupload';
import { log } from '../controllers/logs.js';
import { NSLogs } from '../../types/logs.js';

var router = express.Router();

router.post('/', authorize("POST_voluntaryWork"), validateVoluntaryWork, (req, res, next) => {
    createVoluntaryWork({ ...req.body, creatorId: res.locals.volunteer?.id || res.locals.organizationAdmin?.id }).then(() => {
        res.status(201).send("Voluntary work created successfully!!")
        log({
            userId: res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
            userName: res.locals.organizationAdmin?.name || res.locals.volunteer?.name,
            userType: (res.locals.volunteer ? res.locals.volunteer?.type : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'success' as NSLogs.Type,
            request: 'Create Voluntary Work'
        }).then(() => {
            console.log('logged');
        }).catch(err => {
            console.log('NOT logged');
        })
    }).catch(err => {
        log({
            userId: res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
            userName: res.locals.organizationAdmin?.name || res.locals.volunteer?.name,
            userType: (res.locals.volunteer ? res.locals.volunteer?.type : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Create Voluntary Work'
        }).then(() => {
            console.log('logged');
        }).catch(err => {
            console.log('NOT logged');
        })
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
                request: 'Delete Voluntary Work'
            }).then(() => {
                console.log('logged');
            }).catch(err => {
                console.log('NOT logged');
            })
            res.send(data);
        })
        .catch(err => {
            log({
                userId: res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
                userName: res.locals.organizationAdmin?.name || res.locals.volunteer?.name,
                userType: (res.locals.volunteer ? res.locals.volunteer?.type : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
                type: 'failed' as NSLogs.Type,
                request: 'Delete Voluntary Work'
            }).then(() => {
                console.log('logged');
            }).catch(err => {
                console.log('NOT logged');
            })
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
            request: 'Edit Voluntary Work'
        }).then(() => {
            console.log('logged');
        }).catch(err => {
            console.log('NOT logged');
        })
        res.status(201).send("Voluntary Work edited successfully!!")
    }).catch(err => {
        log({
            userId: res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
            userName: res.locals.organizationAdmin?.name || res.locals.volunteer?.name,
            userType: (res.locals.volunteer ? res.locals.volunteer?.type : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Edit Voluntary Work'
        }).then(() => {
            console.log('logged');
        }).catch(err => {
            console.log('NOT logged');
        })
        next(err);
    });
});

router.get('/', authorize("GET_voluntaryWorks"), async (req, res, next) => {

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
                request: 'Get Voluntary Work/s'
            }).then(() => {
                console.log('logged');
            }).catch(err => {
                console.log('NOT logged');
            })
            res.send(data);
        })
        .catch(err => {
            log({
                userId: res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
                userName: res.locals.organizationAdmin.name,
                userType: (res.locals.volunteer ? res.locals.volunteer?.type : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
                type: 'failed' as NSLogs.Type,
                request: 'Get Voluntary Work/s'
            }).then(() => {
                console.log('logged');
            }).catch(err => {
                console.log('NOT logged');
            })
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
                request: 'Analysis Voluntary Works'
            }).then(() => {
                console.log('logged');
            }).catch(err => {
                console.log('NOT logged');
            })
            res.send(data);
        })
        .catch(err => {
            log({
                userId: res.locals.organizationAdmin?.id,
                userName: res.locals.organizationAdmin?.name,
                userType: "root" as NSLogs.userType,
                type: 'failed' as NSLogs.Type,
                request: 'Analysis Voluntary Works'
            }).then(() => {
                console.log('logged');
            }).catch(err => {
                console.log('NOT logged');
            })
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
            }).then(() => {
                console.log('logged');
            }).catch(err => {
                console.log('NOT logged');
            })
            res.send(data);
        })
        .catch(err => {
            log({
                userId: res.locals.volunteer?.id,
                userName: res.locals.volunteer?.name,
                userType:  res.locals.volunteer?.type as NSLogs.userType,
                type: 'failed' as NSLogs.Type,
                request: 'Get recommendation'
            }).then(() => {
                console.log('logged');
            }).catch(err => {
                console.log('NOT logged');
            })
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
            request: 'Add Rating'
        }).then(() => {
            console.log('logged');
        }).catch(err => {
            console.log('NOT logged');
        })
        res.status(201).send("Rating added successfully!!")
    }).catch(err => {
        log({
            userId: res.locals.volunteer?.id,
            userName: res.locals.volunteer?.name,
            userType: res.locals.volunteer?.type as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Add Rating'
        }).then(() => {
            console.log('logged');
        }).catch(err => {
            console.log('NOT logged');
        })
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
            request: 'Add feedback'
        }).then(() => {
            console.log('logged');
        }).catch(err => {
            console.log('NOT logged');
        })
        res.status(201).send("Feedback added successfully!!")
    }).catch(err => {
        log({
            userId: res.locals.volunteer?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: res.locals.volunteer?.type as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Add feedback'
        }).then(() => {
            console.log('logged');
        }).catch(err => {
            console.log('NOT logged');
        })
        next(err);
    });
});

router.put("/images/:id", validateVoluntaryWorkId, authorize("PUT_images"), async (req, res, next) => {
    putImages(Number(req.params.id), ((Array.isArray(req.files?.image) ? req.files?.image : [req.files?.image]).filter(Boolean)) as UploadedFile[]).then(() => {
        log({
            userId: res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
            userName: res.locals.organizationAdmin?.name || res.locals.volunteer?.name,
            userType: (res.locals.volunteer ? res.locals.volunteer?.type  : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'success' as NSLogs.Type,
            request: 'Add images'
        }).then(() => {
            console.log('logged');
        }).catch(err => {
            console.log('NOT logged');
        })
        res.status(201).send("Images added successfully!!")
    }).catch(err => {
        log({
            userId: res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
            userName: res.locals.organizationAdmin?.name || res.locals.volunteer?.name,
            userType: (res.locals.volunteer ? res.locals.volunteer?.type  : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Add images'
        }).then(() => {
            console.log('logged');
        }).catch(err => {
            console.log('NOT logged');
        })
        next(err);
    });
});

router.put("/register/:id", validateVoluntaryWorkId, authorize("REGISTER_voluntaryWork"), async (req, res, next) => {
    if (res.locals.volunteer) {
        registerByVolunteer(Number(req.params.id), res.locals.volunteer.volunteerProfile).then(() => {
            log({
                userId: res.locals.volunteer?.id,
                userName: res.locals.volunteer?.name,
                userType: res.locals.volunteer?.type  as NSLogs.userType,
                type: 'success' as NSLogs.Type,
                request: 'Register  voluntary work'
            }).then(() => {
                console.log('logged');
            }).catch(err => {
                console.log('NOT logged');
            })
            res.status(201).send("Registration done successfully!!")
        }).catch(err => {
            log({
                userId: res.locals.volunteer?.id,
                userName: res.locals.volunteer?.name,
                userType: res.locals.volunteer?.type  as NSLogs.userType,
                type: 'failed' as NSLogs.Type,
                request: 'Register  voluntary work'
            }).then(() => {
                console.log('logged');
            }).catch(err => {
                console.log('NOT logged');
            })
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
                request: 'Register By Organization Admin'
            }).then(() => {
                console.log('logged');
            }).catch(err => {
                console.log('NOT logged');
            })
            res.status(201).send("Registration done successfully!!")
        }).catch(err => {
            log({
                userId: res.locals.organizationAdmin?.id,
                userName: res.locals.organizationAdmin?.name,
                userType: (res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
                type: 'failed' as NSLogs.Type,
                request: 'Register By Organization Admin'
            }).then(() => {
                console.log('logged');
            }).catch(err => {
                console.log('NOT logged');
            })
            next(err);
        });
    }
});

router.put("/deregister/:id", validateVoluntaryWorkId, authorize("DEREGISTER_voluntaryWork"), async (req, res, next) => {
    deregisterVoluntaryWork(Number(req.params.id), res.locals.volunteer.id || req.body.volunteerId.toString()).then(() => {
        log({
            userId: res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
            userName: res.locals.organizationAdmin?.name || res.locals.volunteer?.name,
            userType: (res.locals.volunteer ? res.locals.volunteer?.type  : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'success' as NSLogs.Type,
            request: 'Deregister voluntary work'
        }).then(() => {
            console.log('logged');
        }).catch(err => {
            console.log('NOT logged');
        })
        res.status(201).send("Deregistration done successfully!!")
    }).catch(err => {
        log({
            userId: res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
            userName: res.locals.organizationAdmin.name || res.locals.volunteer?.name,
            userType: (res.locals.volunteer ? res.locals.volunteer?.type  : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Deregister voluntary work'
        }).then(() => {
            console.log('logged');
        }).catch(err => {
            console.log('NOT logged');
        })
        next(err);
    });
});

export default router;