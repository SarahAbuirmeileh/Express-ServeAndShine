export namespace NSPermission {

    export interface Item {
        id?: number,
        name: string,
        rolesIds?: number[],
        createdAt?: Date
    }
}