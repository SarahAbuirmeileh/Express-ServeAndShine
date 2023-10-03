import { NSPermission } from "../../types/permission.js";
import { OrganizationAdmin } from "../db/entities/OrganizationAdmin.js";
import { Permission } from "../db/entities/Permission.js"
import { Volunteer } from "../db/entities/Volunteer.js";

const createPermission = async (payload: NSPermission.Item) => {
    try {
        const newPermission = Permission.create(payload)
        return newPermission.save();
    }
    catch (error) {
        console.log(error);
    }
}

const deletePermission = async (permissionId: number) => {
    // const roles = sender?.roles;
    // let hasDeletePermission: boolean = false;
    // let typeName: string = "";

    // if (sender instanceof OrganizationAdmin) {
    //     if (!Array.isArray(roles)) {
    //         typeName = "organizationAdmin";
    //         hasDeletePermission = roles.permissions.some(permission => permission.name === `DELETE_${typeName}`);
    //     }
    // } else {
    //     if (Array.isArray(roles)) {
    //         typeName = sender?.type;
    //         hasDeletePermission = roles?.some(role =>
    //             role.permissions.some(permission => permission.name === `DELETE_${typeName}`))
    //     }
    // }

    // if (!hasDeletePermission) {
    //     return `You don't have a permission to delete ${typeName}`
    // }

    return Permission.delete(permissionId);

}

const editPermission = async (payload: { name: string, id: number }) => {
    // const roles = sender.roles;
    // let hasEditPermission: boolean = false;
    // let typeName: string = "";

    // if (sender instanceof OrganizationAdmin) {
    //     if (!Array.isArray(roles)) {
    //         typeName = "organizationAdmin";
    //         hasEditPermission = roles.permissions.some(permission => permission.name === `EDIT_${typeName}`);
    //     }
    // } else {
    //     if (Array.isArray(roles)) {
    //         typeName = sender?.type;
    //         hasEditPermission = roles?.some(role =>
    //             role.permissions.some(permission => permission.name === `DELETE_${typeName}`))
    //     }
    // }

    // if (!hasEditPermission) {
    //     return `You don't have a permission to delete ${typeName}`
    // }

    const permission = await Permission.findOne({ where: { id: payload.id } });

    if (permission) {
        permission.name = payload.name;
        return permission.save();
    } else {
        throw "Permission not found :(";
    }
}

const getPermission = (payload: { id: number }) => {
    return Permission.findOne({ where: { id: payload.id } })
}

const getPermissions = async (payload: {
    page: string,
    pageSize: string
  }) => {  
  
    const page = parseInt(payload.page);
    const pageSize = parseInt(payload.pageSize);
  
    const [permissions, total] = await Permission.findAndCount({
      skip: pageSize * (page - 1),
      take: pageSize,
      order: {
        createdAt: 'ASC'
      }
    })
  
    return {
      page,
      pageSize: permissions.length,
      total,
      permissions
    };
  }

export { createPermission, deletePermission, editPermission, getPermission, getPermissions }