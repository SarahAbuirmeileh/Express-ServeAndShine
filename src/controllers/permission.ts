import { NSPermission } from "../../types/permission.js";
import { Permission } from "../db/entities/Permission.js"

const createPermission = async (payload: NSPermission.Item) => {
    try {
        const newPermission = Permission.create(payload)
        return newPermission.save();
    }
    catch (error){
        console.log(error);
    }
}

export { createPermission }