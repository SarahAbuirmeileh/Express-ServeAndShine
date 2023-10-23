// import { MigrationInterface, QueryRunner } from "typeorm"

// export class CreatePermissions1697004288562 implements MigrationInterface {

//     public async up(queryRunner: QueryRunner): Promise<void> {
//         await queryRunner.query(`
//         INSERT INTO permission (name, createdAt)
//         VALUES
//             ('GET_me', NOW()),
//             ('GET_volunteers', NOW()),
//             ('PUT_volunteer', NOW()),
//             ('DELETE_volunteer', NOW()),
//             ('GET_organizationAdmins', NOW()),
//             ('POST_organizationAdmin', NOW()),
//             ('PUT_organizationAdmin', NOW()),
//             ('DELETE_organizationAdmin', NOW()),
//             ('GET_organizationProfiles', NOW()),
//             ('POST_organizationProfile', NOW()),
//             ('PUT_organizationProfile', NOW()),
//             ('DELETE_organizationProfile', NOW()),
//             ('GET_voluntaryWorks', NOW()),
//             ('POST_voluntaryWork', NOW()),
//             ('PUT_voluntaryWork', NOW()),
//             ('REGISTER_voluntaryWork', NOW()),
//             ('DEREGISTER_voluntaryWork', NOW()),
//             ('DELETE_voluntaryWork', NOW()),
//             ('GET_recommendation', NOW()),
//             ('GET_analysis', NOW()),
//             ('PUT_rating', NOW()),
//             ('PUT_feedback', NOW()),
//             ('PUT_images', NOW()),
//             ('GET_permissions', NOW()),
//             ('POST_permission', NOW()),
//             ('PUT_permission', NOW()),
//             ('DELETE_permission', NOW()),
//             ('GET_roles', NOW()),
//             ('POST_role', NOW()),
//             ('PUT_role', NOW()),
//             ('DELETE_role', NOW())
//     `);
//     }

//     public async down(queryRunner: QueryRunner): Promise<void> {
//         await queryRunner.query(`
//         DELETE FROM permission
//         WHERE name IN (
//             'GET_me',
//             'GET_volunteers',
//             'PUT_volunteer',
//             'DELETE_volunteer',
//             'GET_organizationAdmins',
//             'POST_organizationAdmin',
//             'PUT_organizationAdmin',
//             'DELETE_organizationAdmin',
//             'GET_organizationProfiles',
//             'POST_organizationProfile',
//             'PUT_organizationProfile',
//             'DELETE_organizationProfile',
//             'GET_voluntaryWorks',
//             'POST_voluntaryWork',
//             'PUT_voluntaryWork',
//             'REGISTER_voluntaryWork',
//             'DEREGISTER_voluntaryWork',
//             'DELETE_voluntaryWork',
//             'GET_recommendation',
//             'GET_analysis',
//             'PUT_rating',
//             'PUT_feedback',
//             'PUT_images',
//             'GET_permissions',
//             'POST_permission',
//             'PUT_permission',
//             'DELETE_permission',
//             'GET_roles',
//             'POST_role',
//             'PUT_role',
//             'DELETE_role'
//         )
//     `);
//     }

// }
