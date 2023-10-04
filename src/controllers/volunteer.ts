// import { NSVolunteer } from "../../types/volunteer.js";
// import dataSource from "../db/dataSource.js";
// import { Role } from "../db/entities/Role.js";
// import { VolunteerProfile } from "../db/entities/VolunteerProfile.js";

// const createVolunteer = async (payload: NSVolunteer.Item) => {
//     return dataSource.manager.transaction(async (transaction) => {
//         const [firstName, ...lastName] = payload.name.split(" ")
//         const profile = VolunteerProfile.create({
//             firstName,
//             lastName: lastName.join(" "),
//             dateOfBirth: payload.dateOfBirth || '',
//             status: payload?.status
//         })
//         await transaction.save(profile)
//         const newUser = User.create(payload);
//         const roles = await Role.find({ where: { name: newUser?.type || 'user' } })
//         newUser.roles = roles;
//         newUser.profile = profile;
//         await transaction.save(newUser);
//     });
// };

