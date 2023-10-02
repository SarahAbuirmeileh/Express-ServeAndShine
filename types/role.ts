export namespace NSRole {
    export enum Type {
        root = 'root',
        admin = 'admin',
        normal = 'normal',
        premium = 'premium'
    }

    export interface Item {
        id?: string,
        name: Type,
        createdAt?: Date,
        permissionsId: string[],
        volunteerId?: string[],
        organizationAdmin?: string[]
    }
}