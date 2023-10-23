import "../dist/config.js";
import express from "express";
import request from "supertest";
import { createOrganizationAdmin } from "../dist/src/controllers/organizationAdmin.js";
import organizationProfileRouter from "../dist/src/routes/organizationProfile.js";
import organizationAdminRouter from "../dist/src/routes/organizationAdmin.js";
import volunteerRouter from "../dist/src/routes/volunteer.js";
import permissionRouter from "../dist/src/routes/permission.js";
import dataSource from "../dist/src/db/dataSource.js";
import { deleteOrganizationProfile } from "../dist/src/controllers/OrganizationProfile .js";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

app.use('/organizationProfile', organizationProfileRouter);
app.use("/volunteer", volunteerRouter);
app.use('/organizationAdmin', organizationAdminRouter);
app.use('/permission', permissionRouter);
app.use(express.urlencoded({ extended: false }));


beforeAll(async () => {
    await dataSource.initialize().then(() => {
        console.log('DB connected');
    }).catch(err => {
        console.log("DB connection failed", err);
    });
}, 30000);

afterAll(async () => {
    await dataSource.destroy();
});

describe("Organization profile", () => {
    it("should Create an Organization profile", async () => {
        const org = {
            name: "TestName",
            description: "..."
        };

        const response = await request(app).post("/organizationProfile").send(org);

        expect(response.status).toBe(201);

    });
});

describe("Register process", () => {
    it("should register a Volunteer in app", async () => {
        const volunteer = {
            name: "Tarteel",
            email: "tamimitarteel@gamil.com",
            password: "Tarteel123456?",
            availableTime: ["Afternoon"],
            availableLocation: "Hebron",
            availableDays: ["Friday"],
            skills: ["softskills"]
        };

        const response = await request(app).post("/volunteer/register").send(volunteer);

        expect(response.status).toBe(201);
    });
});

describe("Login process", () => {
    it("should login a Volunteer in app", async () => {
        const volunteer = {
            name: "Tarteel",
            email: "tamimitarteel@gamil.com",
            id: "......"
        };

        const response = await request(app).post("/volunteer/login").send(volunteer);

        expect(response.status).toBe(201);
    });
});

describe("Logout process", () => {
    it("should logout a Volunteer in app", async () => {

        const response = await request(app).get("/volunteer/logout");

        expect(response.status).toBe(200);
    });
});

describe("Permission", () => {
    it("should get all permissions", async () => {

        const response = await request(app).get("/permission").send(volunteer);

        expect(response.status).toBe(200);
    });
});

describe("Organization admin", () => {
    it("should create an Organization admin", async () => {
        const admin = {
            name: "Tarteel",
            email: "tamimitarteel@gmail.com",
            password: "Tarteel123>>",
            organizationId: "60eb3e1b-e7b0-4186-9189-9e860c3164dd"
        };

        const response = await createOrganizationAdmin(admin);

        expect(response.name).toBe("Tarteel");
    });
});

describe("Organization profile", () => {
    it("should delete an Organization profile", async () => {
        const orgId = "cdcc9407-aa39-4b88-99b8-7ae06378eedf"

        const response = await deleteOrganizationProfile(orgId);

        expect(response).toEqual({"affected": 0, "raw": []});
    });
});
