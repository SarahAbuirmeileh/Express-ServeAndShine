import { BaseEntity, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { SkillTag } from "./SkillTag.js";
import { VolunteerProfile } from "./VolunteerProfile.js";
import { OrganizationProfile } from "./OrganizationProfile.js";
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
        type: 'enum',
        enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        nullable: false
    })
    days: ('Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[];

    @Column({
        type: 'enum',
        enum: ['Morning', 'Afternoon'],
        nullable: false
    })
    time: ('Morning' | 'Afternoon')[];

    @Column({ nullable: false })
    location: string;

    @Column({ nullable: false, type: "timestamp" })
    startedDate: Date;

    @Column({ nullable: false, type: "timestamp" })
    finishedDate: Date;

    @Column({
        type: 'enum',
        enum: ['Pending', 'In Progress', 'Finished', 'Canceled'],
        nullable: false
    })
    status: 'Pending' | 'In Progress' | 'Finished' | 'Canceled';

    @Column({ type: 'text', nullable: true, transformer: { to: (value) => JSON.stringify(value), from: (value) => JSON.parse(value) } })
    images: string[];

    @Column({ nullable: true })
    rating: number;

    @Column({ nullable: true })
    feedback: string;

    @Column()
    capacity: number;

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