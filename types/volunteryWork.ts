import { NSVolunteer } from "./volunteer.js";

export namespace NSVoluntaryWork {

    export enum StatusType {
        Pending = 'Pending',
        InProgress = 'In Progress',
        Finished = 'Finished',
        Canceled = 'Canceled'
    }

    export interface Item {
        id?: number;
        name: string;
        description: string;
        location: string;
        time: NSVolunteer.AvailableTime[];
        images: string[];
        rating: number;
        feedback: string;
        status: StatusType;
        createdAt?: Date;
        days: NSVolunteer.AvailableDays[];
        startedDate: Date;
        finishedDate: Date;
        capacity:number;
    }
}
