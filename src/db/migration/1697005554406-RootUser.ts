import { MigrationInterface, QueryRunner } from "typeorm"
import { OrganizationAdmin } from "../entities/OrganizationAdmin.js";
import { Role } from "../entities/Role.js";

export class RootUser1697005554406 implements MigrationInterface {

public async up(queryRunner: QueryRunner): Promise<void> {
    const newOrgAdmin = new OrganizationAdmin();
    newOrgAdmin.name = "root";
    newOrgAdmin.email = ""; 
    newOrgAdmin.password = "root"; 

    const rootRole = await queryRunner.manager.findOne(Role, { where: { name: "root" } });

    if (rootRole) {
        newOrgAdmin.roles = rootRole;
    } else {
        console.error("The 'root' role does not exist.");
    }
    await newOrgAdmin.save();
}
public async down(queryRunner: QueryRunner): Promise<void> {

    const orgAdminToDelete = await queryRunner.manager.findOne(OrganizationAdmin, { where: { name: "root" } });
    if (orgAdminToDelete) {
        await orgAdminToDelete.remove();
    }
}
}
