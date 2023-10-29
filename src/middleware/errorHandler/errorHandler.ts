import express from "express"

const errorHandler = (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction) => {
    if (error.status == 404) {
        res.status(404).send(error.message + " is NOT found");
    } else if (error.status == 401) {
        res.status(401).send("You are unauthorized");
    } else if (error.status == 403) {
        res.status(403).send("You don't have the permission");
    } else if (error.status == 400) {
        res.status(400).send("Your request is BAD, " + error.message);
    } else if (error.status == 406) {
        res.status(400).send("Your request is NOT acceptable, " + error.message);
    } else {
        res.status(500).send('Something went wrong, ' + error.message);
    }
}

export {
    errorHandler
}