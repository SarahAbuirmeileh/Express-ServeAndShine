import express from 'express';
import { NSPermission } from '../../../types/permission.js';
import { OrganizationAdmin } from '../../db/entities/OrganizationAdmin.js';
import { Volunteer } from '../../db/entities/Volunteer.js';
import { VoluntaryWork } from '../../db/entities/VoluntaryWork.js';
import createError from 'http-errors';
import { log } from '../../controllers/logs.js';
import { NSLogs } from '../../../types/logs.js';

const authorize = (api: string) => {
    return async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        const permissions: NSPermission.Item[] = [];

        if (res.locals.organizationAdmin) {
            const organizationAdmin: OrganizationAdmin = res.locals.organizationAdmin;
            permissions.push(...(organizationAdmin.roles.permissions));

        } else if (res.locals.volunteer) {
            const volunteer: Volunteer = res.locals.volunteer;
            volunteer.roles.forEach((role) => {
                permissions.push(...role.permissions);
            });
        }

        if (permissions?.filter(p => p.name === api).length > 0) {
            next();
        } else if ((/^PUT_.+/.test(api)) || (/^DELETE_.+/.test(api))) {
            if ((/organizationProfile$/.test(api))) {
                checkAdmin(req, res, next);
            } else if ((/organizationAdmin$/.test(api)) || (/volunteer$/.test(api))) {
                checkMe(req, res, next);
            } else if ((/voluntaryWork$/.test(api)) || ((/images/.test(api)))) {
                checkCreator(req, res, next);
            } else {
                log({
                    userId: res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
                    userName: res.locals.organizationAdmin?.name || res.locals.volunteer?.name,
                    userType: (res.locals.volunteer ? res.locals.volunteer?.type : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
                    type: 'failed' as NSLogs.Type,
                    request: 'Authorization failed to ' + api
                }).then(() => {
                    console.log('logged');
                }).catch(err => {
                    console.log('NOT logged');
                })
                next(createError(401));
            }
        } else {
            log({
                userId: res.locals.organizationAdmin?.id || res.locals.volunteer?.id,
                userName: res.locals.organizationAdmin?.name || res.locals.volunteer?.name,
                userType: (res.locals.volunteer ? res.locals.volunteer?.type : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
                type: 'failed' as NSLogs.Type,
                request: 'Authorization failed to ' + api
            }).then(() => {
                console.log('logged');
            }).catch(err => {
                console.log('NOT logged');
            })
            next(createError(401));
        }
    }
}

const checkMe = (req: express.Request, res: express.Response, next: express.NextFunction) => {

    const id = req.params.id;
    if (res.locals.volunteer) {
        if (res.locals.volunteer.id == id) {
            next();
        } else {
            log({
                userId: res.locals.volunteer?.id,
                userName: res.locals.volunteer?.name,
                userType: (res.locals.volunteer ? res.locals.volunteer?.type : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
                type: 'failed' as NSLogs.Type,
                request: 'Authorization failed'
            }).then(() => {
                console.log('logged');
            }).catch(err => {
                console.log('NOT logged');
            })
            next(createError(401));
        }
    } else if (res.locals.organizationAdmin) {
        if (res.locals.organizationAdmin.id == id) {
            next();
        } else {
            log({
                userId: res.locals.volunteer?.id,
                userName: res.locals.volunteer?.name,
                userType: (res.locals.volunteer?.type) as NSLogs.userType,
                type: 'failed' as NSLogs.Type,
                request: 'Authorization failed'
            }).then(() => {
                console.log('logged');
            }).catch(err => {
                console.log('NOT logged');
            })
            next(createError(401));
        }
    }

}

const checkAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const id = req.params.id;
    const admin = await OrganizationAdmin.findOne({ where: { orgProfile: { id } } });

    if (res.locals.organizationAdmin) {
        if (res.locals.organizationAdmin.id == admin?.id) {
            next();
        } else {
            log({
                userId: res.locals.organizationAdmin?.id,
                userName: res.locals.organizationAdmin?.name,
                userType: (res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
                type: 'failed' as NSLogs.Type,
                request: 'Authorization failed'
            }).then(() => {
                console.log('logged');
            }).catch(err => {
                console.log('NOT logged');
            })
            next(createError(401));
        }
    } else {
        log({
            userId: res.locals.organizationAdmin?.id,
            userName: res.locals.organizationAdmin?.name,
            userType: (res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Authorization failed'
        }).then(() => {
            console.log('logged');
        }).catch(err => {
            console.log('NOT logged');
        })
        next(createError(401));
    }
}

const checkCreator = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const id = Number(req.params.id);

    let voluntaryWork = await VoluntaryWork.findOne({ where: { id } });

    if (res.locals.organizationAdmin) {
        if (res.locals.organizationAdmin.id == voluntaryWork?.creatorId) {
            next();
        } else {
            log({
                userId: res.locals.organizationAdmin?.id,
                userName: res.locals.organizationAdmin?.name,
                userType: (res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
                type: 'failed' as NSLogs.Type,
                request: 'Authorization failed'
            }).then(() => {
                console.log('logged');
            }).catch(err => {
                console.log('NOT logged');
            })
            next(createError(401));
        }
    } else if (res.locals.volunteer) {
        if (res.locals.volunteer?.id == voluntaryWork?.creatorId) {
            next();
        } else {
            log({
                userId: res.locals.volunteer?.id,
                userName: res.locals.volunteer?.name,
                userType: (res.locals.volunteer?.type) as NSLogs.userType,
                type: 'failed' as NSLogs.Type,
                request: 'Authorization failed'
            }).then(() => {
                console.log('logged');
            }).catch(err => {
                console.log('NOT logged');
            })
            next(createError(401));
        }
    } else {
        next(createError(401));
    }
}

const checkParticipation = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const id = Number(req.params.id);

    if (res.locals.volunteer) {
        const volunteer = res.locals.volunteer;
        const volunteerProfile = volunteer.volunteerProfile;

        if (volunteerProfile) {
            const voluntaryWork = await VoluntaryWork.findOne({
                where: { id },
                relations: ['volunteerProfiles']
            });

            if (voluntaryWork) {
                // Check if volunteerProfile.id exists in the array of volunteerProfiles' ids
                const isParticipating = voluntaryWork.volunteerProfiles.some(profile => profile.id === volunteerProfile.id);

                if (isParticipating) {
                    next();
                } else {
                    log({
                        userId: res.locals.volunteer?.id,
                        userName: res.locals.volunteer?.name,
                        userType: (res.locals.volunteer?.type) as NSLogs.userType,
                        type: 'failed' as NSLogs.Type,
                        request: 'Authorization failed'
                    }).then(() => {
                        console.log('logged');
                    }).catch(err => {
                        console.log('NOT logged');
                    })
                    next(createError(401));
                }
            } else {
                next(createError(404)); // Optional: Handle the case when voluntaryWork is not found
            }
        } else {
            next(createError(401)); // Handle the case when volunteerProfile is not defined
        }
    } else {
        log({
            userId: res.locals.organizationAdmin?.id ||res.locals.volunteer?.id,
            userName:res.locals.organizationAdmin?.name || res.locals.volunteer?.name,
            userType: (res.locals.volunteer ? res.locals.volunteer?.type : res.locals.organizationAdmin?.name === "root" ? "root" : 'admin') as NSLogs.userType,
            type: 'failed' as NSLogs.Type,
            request: 'Authorization failed'
        }).then(() => {
            console.log('logged');
        }).catch(err => {
            console.log('NOT logged');
        })
        next(createError(401)); // Handle the case when res.locals.volunteer is not defined
    }
};


export {
    authorize,
    checkMe,
    checkAdmin,
    checkCreator,
    checkParticipation
}