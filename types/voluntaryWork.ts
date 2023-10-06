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

    export interface GetVoluntaryWorks {
        page: string,
        pageSize: string,
        id: number,
        name: string,
        time: NSVolunteer.AvailableTime[],
        location: string,
        days: NSVolunteer.AvailableDays[],
        rating: number,
        status: NSVoluntaryWork.StatusType,
        skills: string[],
        startedDate: string;
        finishedDate: string;
        capacity: number;
        finishedAfter: string;
        finishedBefore: string;
        startedAfter: string;
        startedBefore: string;
        ratingMore:number;
        ratingLess:number;
        creatorId:string;
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
        creatorId:string;
    }
}
