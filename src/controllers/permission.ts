import baseLogger from "../../logger.js";
import { NSPermission } from "../../types/permission.js";
import { Permission } from "../db/entities/Permission.js"
import createError from 'http-errors';

const error = { status: 500, message: 'when trying to manage permission' };

const createPermission = async (payload: NSPermission.Item) => {
  try {
    const newPermission = Permission.create(payload)
    return newPermission.save();
  }
  catch (err) {
    baseLogger.error(err);
    throw createError(error.status, error.message);
  }
}

const deletePermission = async (permissionId: number) => {
  try {
    return Permission.delete(permissionId);
  } catch (err) {
    baseLogger.error(err);
    throw createError(error.status, error.message);
  }
}

const editPermission = async (payload: { name: string, id: number }) => {
  try {

    const permission = await Permission.findOne({ where: { id: payload.id } });

    if (permission) {
      permission.name = payload.name;
      return permission.save();
    }
  } catch (err) {
    baseLogger.error(err);
    throw createError(error.status, error.message);
  }
}

const getPermissions = async (payload: {
  page: string,
  pageSize: string,
  id: number,
  name: string
}) => {
  try {

    const page = parseInt(payload.page);
    const pageSize = parseInt(payload.pageSize);

    if (payload.id) {
      return Permission.findOne({ where: { id: payload.id } })
    }

    if (payload.name) {
      return Permission.findOne({ where: { name: payload.name } })
    }

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
  } catch (err) {
    baseLogger.error(err);
    throw createError(error.status, error.message);
  }
}

export { createPermission, deletePermission, editPermission, getPermissions }