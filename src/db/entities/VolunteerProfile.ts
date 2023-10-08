import { BaseEntity, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { SkillTag } from "./SkillTag.js";
import { VoluntaryWork } from "./VoluntaryWork.js";
import { NSVolunteer } from "../../../types/volunteer.js";

@Entity()
export class VolunteerProfile extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'json',
        nullable: false
    })
    availableTime: NSVolunteer.AvailableTime[];

    @Column({
        type: 'json',
        nullable: false
    })
    availableDays:NSVolunteer.AvailableDays[];

    @Column({ nullable: false })
    availableLocation: string;

    @Column({ nullable: true, type: "timestamp" })
    dateOfBirth: Date;

    @ManyToMany(() => SkillTag)
    @JoinTable()
    skillTags: SkillTag[];

    @ManyToMany(() => VoluntaryWork)
    @JoinTable()
    roles: VoluntaryWork[];

    @CreateDateColumn({
        type: 'timestamp',
        default: () => "CURRENT_TIMESTAMP(6)"
    })
    createdAt: Date;
}