import { VolunteerProfile } from "../src/db/entities/VolunteerProfile.js";
import { Role } from "../src/db/entities/Role.js";


export namespace NSVolunteer {

    export enum AvailableDays {
        Sunday = 'Sunday',
        Monday = 'Monday',
        Tuesday = 'Tuesday',
        Wednesday = 'Wednesday',
        Thursday = 'Thursday',
        Friday = 'Friday',
        Saturday = 'Saturday',
    }

    export enum Gender {
        male = 'male',
        female = "female"
    }

    export enum AvailableTime {
        Morning = 'Morning',
        Afternoon = 'Afternoon'
    }

    export enum TypeVolunteer {
        volunteer = "volunteer",
        premium = "premium"
    }

    export interface Item {
        id?: string;
        name: string;
        email: string;
        password: string;
        createdAt?: Date;
        type?: TypeVolunteer;
        availableTime: AvailableTime[];
        availableLocation: string;
        availableDays: AvailableDays[];
        skills: string[];
        gender:Gender;
    }

    export interface IVolunteer {
        volunteerProfile: VolunteerProfile;
        id: string;
        name: string;
        email: string;
        password: string;
        type: 'volunteer' | 'premium';
        roles: Role[];
        createdAt: Date;
    }
}