import { DataSource } from "typeorm";
import { OrganizationAdmin } from "./entities/OrganizationAdmin.js";
import { OrganizationProfile } from "./entities/OrganizationProfile.js";
import { Permission } from "./entities/Permission.js";
import { Role } from "./entities/Role.js";
import { SkillTag } from "./entities/SkillTag.js";
import { VoluntartyWork } from "./entities/VoluntaryWork.js";
import { Volunteer } from "./entities/Volunteer.js";
import { VolunteerProfile } from "./entities/VolunteerProfile.js";

const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [OrganizationAdmin, OrganizationProfile, Permission,
        Role, SkillTag, VoluntartyWork, Volunteer, VolunteerProfile],
    migrations: ['./**/migration/*.ts'],
    synchronize: true,
    logging: false
});

export default dataSource;