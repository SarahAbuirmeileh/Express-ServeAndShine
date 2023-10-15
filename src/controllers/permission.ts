import baseLogger from "../../logger.js";
import { NSPermission } from "../../types/permission.js";
import { Permission } from "../db/entities/Permission.js"
import createError from 'http-errors';

const createPermission = async (payload: NSPermission.Item) => {
  try {
    const newPermission = Permission.create(payload)
    return newPermission.save();
  }
  catch (error) {
    baseLogger.error(error);
    throw ", when trying to create Permission";
  }
}

const deletePermission = async (permissionId: number) => {
  try {
    return Permission.delete(permissionId);
  } catch (err) {
    baseLogger.error(err);
    throw createError({status: 404, message: "Permission"});
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
    throw createError({status: 404, message: "Permission"});
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
    throw createError({status: 404, message: "Permission"});
  }
}

export { createPermission, deletePermission, editPermission, getPermissions }