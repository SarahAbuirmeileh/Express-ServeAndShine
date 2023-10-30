import { NSVolunteer } from "./volunteer.js";

export namespace NSOrganizationAdmin {

    export interface Item {
        id?: string;
        name: string;
        email: string;
        password: string;
        organizationId: string;
        createdAt?: Date;
        gender:NSVolunteer.Gender;
    }
}
