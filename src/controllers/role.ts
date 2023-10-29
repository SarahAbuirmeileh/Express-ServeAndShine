import { In } from "typeorm";
import { NSRole } from "../../types/role.js";
import { Permission } from "../db/entities/Permission.js";
import { Role } from "../db/entities/Role.js";
import createError from 'http-errors';
import baseLogger from "../../logger.js";

const error = { status: 500, message: 'when trying to manage role' };

const createRole = async (payload: NSRole.Item) => {
  try {
    const newRole = Role.create(payload);
    const permissions = await Permission.find({
      where: { id: In(payload.permissionsId) },
    });

    newRole.permissions = permissions
    return newRole.save();
  }
  catch (err) {
    baseLogger.error(err);
    throw createError(error.status, error.message);
  }
}

const deleteRole = async (roleId: number) => {
  try {
    return Role.delete(roleId);
  } catch (err) {
    baseLogger.error(err);
    throw createError(error.status, error.message);
  }
}

const editRole = async (payload: { name: NSRole.Type, id: number }) => {
  try {

    const role = await Role.findOne({ where: { id: payload.id } });
    if (role) {
      role.name = payload.name;
      return role.save();
    }
  } catch (err) {
    baseLogger.error(err);
    throw createError(error.status, error.message);
  }
}

const getRoles = async (payload: {
  page: string,
  pageSize: string,
  id: number,
  name: NSRole.Type
}) => {
  try {
    const page = parseInt(payload.page);
    const pageSize = parseInt(payload.pageSize);

    if (payload.id) {
      return Role.findOne({ where: { id: payload.id } })
    }

    if (payload.name) {
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
  } catch (err) {
    baseLogger.error(err);
    throw createError(error.status, error.message);
  }
}

export { createRole, editRole, getRoles, deleteRole }