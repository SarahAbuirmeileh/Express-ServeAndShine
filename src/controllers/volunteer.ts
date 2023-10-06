// import { NSVolunteer } from "../../types/volunteer.js";
// import dataSource from "../db/dataSource.js";
// import { Volunteer } from "../db/entities/Volunteer.js";
// import { VolunteerProfile } from "../db/entities/VolunteerProfile.js";

import { OrganizationAdmin } from "../db/entities/OrganizationAdmin.js";
import { Volunteer } from "../db/entities/Volunteer.js";
import jwt from 'jsonwebtoken';


// const createVolunteer = async (payload: NSVolunteer.Item) => {

//     return dataSource.manager.transaction(async (transaction) => {

//         const profile = VolunteerProfile.create({
//             availableTime: payload.availableTime

//         })

//         await transaction.save(profile);

//         const newUser = User.create(payload);
//         const roles = await Role.find({ where: { name: newUser?.type || 'user' } })
//         newUser.roles = roles;
//         newUser.profile = profile;
//         await transaction.save(newUser);
//     });


// };

// const deleteVolunteer = async (volunteerId: number) => {
//     return Volunteer.delete(volunteerId);
// }

const login = async (email: string, name: string, id: string) => {
    const volunteer = await Volunteer.findOne({
        where: { email, name, id },
        relations: ["roles", "roles.permissions"],
    });

    const organizationAdmin = await OrganizationAdmin.findOne({
        where: { email, name, id },
        relations: ["roles", "roles.permissions"],
    });

    if (volunteer) {
        const token = jwt.sign(
            { email, name, id },
            process.env.SECRET_KEY || '',
            {
                expiresIn: "15m"
            }
        );
        return token;
    } else if (organizationAdmin) {
        const token = jwt.sign(
            { email, name, id },
            process.env.SECRET_KEY || '',
            {
                expiresIn: "15m"
            }
        );
        return token;
    } else {
        throw ("Invalid email or name or id !");
    }

}

export { login,/* createVolunteer, deleteVolunteer,*/ }

