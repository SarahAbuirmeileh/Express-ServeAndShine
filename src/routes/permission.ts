import express from 'express';
import { createPermission, deletePermission } from '../controllers/permission.js';
import { OrganizationAdmin } from '../db/entities/OrganizationAdmin.js';
import { Volunteer } from '../db/entities/Volunteer.js';

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
    const id = Number(req.params.id?.toString()) ;
    let sender: OrganizationAdmin | Volunteer = new Volunteer();
    if (res.locals.organizationAdmin) {
        sender = await OrganizationAdmin.findOne({
            where: {
                name: res.locals.user.name, email: res.locals?.user.email
            }, relations: ["roles", "roles.permissions"]
        }) || new OrganizationAdmin();
    }else if(res.locals.volunteer){
        sender = await Volunteer.findOne({
            where: {
                name: res.locals.user.name, email: res.locals?.user.email
            }, relations: ["roles", "roles.permissions"]
        }) || new Volunteer();
    }

    deletePermission(id, sender)
        .then(data => {
            res.send(data);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Something went wrong');
        });
})

export default router;

