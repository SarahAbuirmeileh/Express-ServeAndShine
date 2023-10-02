export namespace NSVoluntaryWork {

    export enum StatusType {
        Pending = 'Pending',
        InProgress = 'In Progress',
        Finished = 'Finished',
        Canceled = 'Canceled'
    }

    export interface Item {
        id?: string;
        name: string;
        description: string;
        location: string;
        time: string;
        images: string;
        rating: number;
        feedback: string;
        status: StatusType;
        createdAt?: Date;
    }
}
