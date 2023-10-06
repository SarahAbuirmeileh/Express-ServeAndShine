// import { NSVolunteer } from "../../types/volunteer.js";
// import dataSource from "../db/dataSource.js";
// import { Volunteer } from "../db/entities/Volunteer.js";
// import { VolunteerProfile } from "../db/entities/VolunteerProfile.js";

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

// export { createVolunteer, deleteVolunteer, }

