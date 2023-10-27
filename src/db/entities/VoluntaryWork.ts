import { BaseEntity, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { SkillTag } from "./SkillTag.js";
import { VolunteerProfile } from "./VolunteerProfile.js";
import { OrganizationProfile } from "./OrganizationProfile.js";
import { NSVolunteer } from "../../../types/volunteer.js";
import { NSVoluntaryWork } from "../../../types/voluntaryWork.js";

@Entity()
export class VoluntaryWork extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ unique: true, nullable: false })
    name: string;

    @Column({ nullable: false })
    description: string;

    @Column({
        type: 'json',
        nullable: false
    })
    days: NSVolunteer.AvailableDays[];

    @Column({
        type: 'json',
        nullable: false
    })
    time: NSVolunteer.AvailableTime[];

    @Column({ nullable: false })
    location: string;

    @Column({ nullable: false, type: "timestamp" })
    startedDate: Date;

    @Column({ nullable: true, type: "timestamp" })
    finishedDate: Date;

    @Column({
        type: 'enum',
        enum: ['Pending', 'In Progress', 'Finished', 'Canceled'],
        nullable: false
    })
    status: 'Pending' | 'In Progress' | 'Finished' | 'Canceled';

    @Column({ type: 'json', nullable: true })
    images: string[];

    @Column({ nullable: true, default: 0.0, type: 'float' })
    avgRating: number;

    @Column({ type: 'json', nullable: true })
    feedback: NSVoluntaryWork.Feedback[];

    @Column({ type: 'json', nullable: true })
    rating: NSVoluntaryWork.Rating[];

    @Column({nullable:false})
    capacity: number;

    @Column({nullable:false})
    creatorId: string;

    @ManyToMany(() => SkillTag)
    @JoinTable()
    skillTags: SkillTag[];

    @ManyToMany(() => VolunteerProfile)
    @JoinTable()
    volunteerProfiles: VolunteerProfile[];

    @ManyToOne(() => OrganizationProfile, organizationProfile => organizationProfile.voluntaryWork)
    orgProfiles: OrganizationProfile;

    @CreateDateColumn({
        type: 'timestamp',
        default: () => "CURRENT_TIMESTAMP(6)"
    })
    createdAt: Date;
}