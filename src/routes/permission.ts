import express from 'express';
import { createPermission } from '../controllers/permission.js'; 

var router = express.Router();

router.post('/', (req, res, next) => {
    createPermission(req.body).then(() => {
    res.status(201).send("Permission created successfully!!")
  }).catch(err => {
    console.error(err);
    res.status(500).send(err);
  });
});

export default router;

