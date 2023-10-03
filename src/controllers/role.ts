import { In } from "typeorm";
import { NSRole } from "../../types/role.js";
import { Permission } from "../db/entities/Permission.js";
import { Role } from "../db/entities/Role.js";

const createRole = async (payload: NSRole.Item) => {
    try {
        const newRole = Role.create(payload);
        const permissions = await Permission.find({
            where: { id: In(payload.permissionsId) },
          });
    
        newRole.permissions =permissions
        return newRole.save();
    }
    catch (error) {
        console.log(error);
    }
}

const deleteRole = async (roleId: number) => {
    return Role.delete(roleId);
}

const editRole = async (payload: { name: NSRole.Type, id: number }) => {
    const role = await Role.findOne({ where: { id: payload.id } });
    // need validation
    if (role) {
        role.name = payload.name;
        return role.save();

    } else {
        throw "Role not found :(";
    }
}

const getRoles = async (payload: {
    page: string,
    pageSize: string,
    id: number,
    name: NSRole.Type
  }) => {
  
    const page = parseInt(payload.page);
    const pageSize = parseInt(payload.pageSize);
  
    if (payload.id){
      return Role.findOne({ where: { id: payload.id } })
    }
  
    if (payload.name){
      return Role.findOne({ where: { name: payload.name } })
    }
  
    const [roles, total] = await Role.findAndCount({
      skip: pageSize * (page - 1),
      take: pageSize,
      order: {
        createdAt: 'ASC'
      }
    })
  
    return {
      page,
      pageSize: roles.length,
      total,
      roles
    };
  }

export { createRole, editRole, getRoles, deleteRole }