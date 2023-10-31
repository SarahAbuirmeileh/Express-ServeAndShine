export namespace NSRole {
    export enum Type {
        root = 'root',
        admin = 'admin',
        volunteer = 'volunteer',
        premium = 'premium'
    }

    export interface Item {
        id?: number,
        name: Type,
        createdAt?: Date,
        permissionsId: number[],
        volunteerId?: string[],
        organizationAdmin?: string[]
    }
}