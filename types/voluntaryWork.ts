import { SkillTag } from "../src/db/entities/SkillTag.js";
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
        feedback?: NSVoluntaryWork.Feedback[];
        status?: StatusType;
        days?: NSVolunteer.AvailableDays[];
        startedDate?: string;
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
        avgRating: number,
        status: NSVoluntaryWork.StatusType,
        skills: string[],
        startedDate: string;
        finishedDate: string;
        capacity: number;
        finishedAfter: string;
        finishedBefore: string;
        startedAfter: string;
        startedBefore: string;
        avgRatingMore: number;
        avgRatingLess: number;
        creatorId: string;
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
        avgRating?: number;
        feedback?: NSVoluntaryWork.Feedback[];
        status: StatusType;
        createdAt?: Date;
        days: NSVolunteer.AvailableDays[];
        startedDate: string;
        finishedDate: string;
        capacity: number;
        skillTagIds: number[];
        creatorId: string;
    }

    export interface Recommendation {
        page: string,
        pageSize: string,
        time: NSVolunteer.AvailableTime[],
        location: string,
        days: NSVolunteer.AvailableDays[],
        status: NSVoluntaryWork.StatusType,
        skillTags: number[]
    }

    export interface Rating {
        volunteerName: string,
        rating: number
    }

    export interface Feedback {
        volunteerName: string,
        feedback: string
    }
}
