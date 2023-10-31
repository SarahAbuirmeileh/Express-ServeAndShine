export namespace NSLogs {

    export enum userType {
        root = 'root',
        admin = 'admin',
        volunteer = 'volunteer',
        premium = 'premium'
    }

    export enum Type {
        success = 'success',
        failed = 'failed'
    }

    export interface Item {
        id?: number;
        userId: string;
        userName: string;
        userType: userType;
        type:Type;
        request: string;
        createdAt?: Date;
    }
}
