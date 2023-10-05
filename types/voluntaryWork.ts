import { NSVolunteer } from "./volunteer.js";

export namespace NSVoluntaryWork {

    export enum StatusType {
        Pending = 'Pending',
        InProgress = 'In Progress',
        Finished = 'Finished',
        Canceled = 'Canceled'
    }

    export interface Edit {
        id: string;
        name?: string;
        description?: string;
        location?: string;
        time?: NSVolunteer.AvailableTime[];
        images?: string[];
        rating?: number[];
        feedback?: string[];
        status?: StatusType;
        days?: NSVolunteer.AvailableDays[];
        startedDate?:string;
        finishedDate?: string;
        capacity?: number;
        skillTagIds?: number[];
        createdAt?: Date;

    }

    export interface Date {
        year: number;
        month: number;
        day: number;
    };

    export interface Item {
        id?: string;
        name: string;
        description: string;
        location: string;
        time: NSVolunteer.AvailableTime[];
        images?: string[];
        rating?: number[];
        feedback?: string[];
        status: StatusType;
        createdAt?: Date;
        days: NSVolunteer.AvailableDays[];
        startedDate: string;
        finishedDate: string;
        capacity: number;
        skillTagIds: number[];
    }
}