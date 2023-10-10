import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateRoles1696963025886 implements MigrationInterface {

// for permissions

public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO role (name)
        VALUES ('root')
    `);

    const result = await queryRunner.query(`
        SELECT id FROM role WHERE name = 'root'
    `);

    const roleId = result[0].id;
    const permissionIds = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
        11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31
    ];

    for (const permissionId of permissionIds) {
        await queryRunner.query(`
            INSERT INTO role_permissions_permission (roleId, permissionId)
            VALUES (${roleId}, ${permissionId})
        `);
    }

    await queryRunner.query(`
    INSERT INTO role (name)
    VALUES ('admin')
`);

// Get the ID of the inserted 'admin' role
const adminRoleId = (await queryRunner.query(`
    SELECT id FROM role WHERE name = 'admin'
`))[0].id;

// Insert permissions for the 'admin' role
const adminPermissionIds = [1, 2, 3, 4, 5, 9, 13, 14, 16, 17];

for (const permissionId of adminPermissionIds) {
    await queryRunner.query(`
        INSERT INTO role_permissions_permission (roleId, permissionId)
        VALUES (${adminRoleId}, ${permissionId})
    `);
}

await queryRunner.query(`
    INSERT INTO role (name)
    VALUES ('premium')
`);

const premiumRoleId = (await queryRunner.query(`
    SELECT id FROM role WHERE name = 'premium'
`))[0].id;

const premiumPermissionIds = [1, 2, 5, 9, 13, 14, 16, 17, 19, 21, 22];

for (const permissionId of premiumPermissionIds) {
    await queryRunner.query(`
        INSERT INTO role_permissions_permission (roleId, permissionId)
        VALUES (${premiumRoleId}, ${permissionId})
    `);
}

// Insert the 'volunteer' role
await queryRunner.query(`
    INSERT INTO role (name)
    VALUES ('volunteer')
`);

// Get the ID of the inserted 'volunteer' role
const volunteerRoleId = (await queryRunner.query(`
    SELECT id FROM role WHERE name = 'volunteer'
`))[0].id;

// Insert permissions for the 'volunteer' role
const volunteerPermissionIds = [1, 2, 5, 9, 13, 16, 17, 19, 21, 22];

for (const permissionId of volunteerPermissionIds) {
    await queryRunner.query(`
        INSERT INTO role_permissions_permission (roleId, permissionId)
        VALUES (${volunteerRoleId}, ${permissionId})
    `);
}
}

public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    DELETE FROM role WHERE name = 'root'
`);

    const permissionIdsToDelete = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];

    for (const permissionId of permissionIdsToDelete) {
        await queryRunner.query(`
        DELETE FROM role_permissions_permission
        WHERE roleId = (SELECT id FROM role WHERE name = 'root') AND permissionId = ${permissionId}
    `);
    }
    await queryRunner.query(`
    DELETE FROM role_permissions_permission
    WHERE roleId = (SELECT id FROM role WHERE name = 'admin')
`);

await queryRunner.query(`
    DELETE FROM role WHERE name = 'admin'
`);

// Delete the 'premium' role and its associated permissions
await queryRunner.query(`
    DELETE FROM role_permissions_permission
    WHERE roleId = (SELECT id FROM role WHERE name = 'premium')
`);

await queryRunner.query(`
    DELETE FROM role WHERE name = 'premium'
`);

// Delete the 'volunteer' role and its associated permissions
await queryRunner.query(`
    DELETE FROM role_permissions_permission
    WHERE roleId = (SELECT id FROM role WHERE name = 'volunteer')
`);

await queryRunner.query(`
    DELETE FROM role WHERE name = 'volunteer'
`);
}
}
