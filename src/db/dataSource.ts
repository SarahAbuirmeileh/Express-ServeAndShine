import { DataSource } from "typeorm";
import { OrganizationAdmin } from "./entities/OrganizationAdmin.js";
import { OrganizationProfile } from "./entities/OrganizationProfile.js";
import { Permission } from "./entities/Permission.js";
import { Role } from "./entities/Role.js";
import { SkillTag } from "./entities/SkillTag.js";
import { VoluntaryWork } from "./entities/VoluntaryWork.js";
import { Volunteer } from "./entities/Volunteer.js";
import { VolunteerProfile } from "./entities/VolunteerProfile.js";
import { Logs } from "./entities/Logs.js";

const dataSource = new DataSource({
  
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username:  process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [OrganizationAdmin, OrganizationProfile, Permission,
    Role, SkillTag, VoluntaryWork, Volunteer, VolunteerProfile, Logs],
  migrations: ['./**/migration/*.ts'],
  synchronize: true,
  logging: false
});

export const initDB = async () =>
  await dataSource.initialize().then(() => {
    console.log("Connected to DB!");
  }).catch(err => {
    console.log('Failed to connect to DB: ' + err)
  });

export default dataSource;
