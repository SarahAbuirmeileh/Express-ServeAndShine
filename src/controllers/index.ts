import express from 'express'
import { OrganizationAdmin } from '../db/entities/OrganizationAdmin.js';
import { Volunteer } from '../db/entities/Volunteer.js';

const getSender = async (res: express.Response) => {
    let sender: OrganizationAdmin | Volunteer = new Volunteer();
    if (res.locals.organizationAdmin) {
        sender = await OrganizationAdmin.findOne({
            where: {
                name: res.locals.organizationAdmin.name, email: res.locals?.organizationAdmin.email
            }, relations: ["roles", "roles.permissions"]
        }) || new OrganizationAdmin();
    } else if (res.locals.volunteer) {
        sender = await Volunteer.findOne({
            where: {
                name: res.locals.volunteer.name, email: res.locals?.volunteer.email
            }, relations: ["roles", "roles.permissions"]
        }) || new Volunteer();
    }
    return sender;
}

const getDate = (date: string): Date => {
    let [year, month, day] = date.split('-').map((str) => { return parseInt(str, 10); });
    return new Date(year, month - 1, day, 0, 0, 0, 0);
}

const isValidPassword = (password: string) => {
    const validation = [];
    if (password.length < 10) {
        validation.push("The password should be at least 10 characters");
    }

    if (!/[A-Z]/.test(password)) {
        validation.push("The password should contains at least one uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
        validation.push("The password should contains at least one lowercase letter");
    }

    if (!/[0-9]/.test(password)) {
        validation.push("The password should contains at least one digit (number)");
    }

    if (!/[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/.test(password)) {
        validation.push("The password should contains at least one special character");
    }
    return validation;
};

const isValidDate = (date: string) => {
    const datePattern = /^\d{4}-(0?[1-9]|1[0-2])-(0?[1-9]|[12]\d|3[01])$/;
    if (!datePattern.test(date)) {
        return false;
    }

    const [year, month, day] = date.split('-').map(Number);
    const daysInMonth: { [key: number]: number } = {
        1: 31, 2: 28, 3: 31, 4: 30, 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31,
    };

    if (month === 2 && ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0))) {
        daysInMonth[2] = 29;
    }

    return day <= daysInMonth[month];
}
export { getSender, getDate, isValidPassword, isValidDate };