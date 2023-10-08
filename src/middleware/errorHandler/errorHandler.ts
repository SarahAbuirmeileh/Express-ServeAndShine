import express from "express"

const errorHandler = (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction) => {
    if (error.status == 404) {
        res.status(404).send("Something is not found");
    } else if (error.status == 401) {
        res.status(401).send("You are unauthorized");
    } else if (error.status == 403) {
        res.status(401).send("You don't have the permission");
    } else {
        res.status(500).send('Something went wrong');
    }
}

export {
    errorHandler
}