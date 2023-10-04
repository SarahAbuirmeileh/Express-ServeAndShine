import express from "express";
import { creatOrganizationAdmin } from "../controllers/organizationAdmin.js";

var router = express.Router();

router.post('/', (req, res, next) => {
    creatOrganizationAdmin(req.body).then((data) => {
        console.log(data);
        
        res.status(201).send("Organization Admin created successfully!!")
    }).catch(err => {
        console.error(err);
        res.status(500).send(err);
    });
});

export default router;