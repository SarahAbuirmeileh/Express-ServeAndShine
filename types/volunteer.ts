export namespace NSVolunteer {

    export enum TypeVolunteer {
        volunteer = "volunteer",
        premium = "premium"
    }

    export enum AvailableTime {
        Morning = 'Morning',
        Afternoon = 'Afternoon'
    }

    export enum AvailableDays {
        Sunday = 'Sunday',
        Monday = 'Monday',
        Tuesday = 'Tuesday',
        Wednesday = 'Wednesday',
        Thursday = 'Thursday',
        Friday = 'Friday',
        Saturday = 'Saturday',
    }

    export interface Item {
        id?: string;
        name: string;
        email: string;
        password: string;
        createdAt?: Date;
        type: TypeVolunteer;
        availableTime: AvailableTime[];
        availableLocation: string;
        PreferredActivities: string[];
        availableDays: AvailableDays[];
    }
}