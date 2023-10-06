import express from 'express';
import { authorize, checkMe } from '../middleware/auth/authorize.js';
import { authenticate } from '../middleware/auth/authenticate.js';
import { validateVolunteer } from '../middleware/validation/volunteer.js';
import { login } from '../controllers/volunteer.js';

var router = express.Router();

router.post('/register', validateVolunteer, (req, res, next) => {
    // create volunteer
});

router.post('/login', (req, res, next) => {
    const email = req.body.email;
    const name = req.body.name;
    const id = req.body.id;
    login(email, name, id)
        .then(data => {
            res.cookie('myApp', data, {
                httpOnly: true,
                maxAge: 15 * 60 * 1000,
                sameSite: "lax"       // Protect against CSRF attacks
            });
            res.cookie('name', res.locals.volunteer.name || res.locals.organizationAdmin.name, {
                httpOnly: true,
                maxAge: 15 * 60 * 1000,
                sameSite: "lax"       // Protect against CSRF attacks
            });
            res.status(201).send(data);
        })
        .catch(err => {
            res.status(401).send(err);
        })
});

router.delete('/:id', authenticate, authorize("DELETE_volunteer"), checkMe, async (req, res) => {

})

router.put("/:id", authenticate, authorize("POST_volunteer"), checkMe, async (req, res, next) => {

});

router.get('/', authenticate, authorize("GET_volunteers"), async (req, res, next) => {

});

router.get("/logout", authenticate, (req, res, next) => {
    res.cookie("name", '', {
        maxAge: -1
    })
    res.cookie("myApp", '', {
        maxAge: -1
    })

    res.send("Logout correctly!");
})

router.get('/me', authenticate, async (req, res, next) => {
    if (res.locals.volunteer) {
        res.send(res.locals.volunteer);
    } else if (res.locals.organizationAdmin) {
        res.send(res.locals.organizationAdmin);
    }
});

export default router;

