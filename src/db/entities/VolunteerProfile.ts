import { BaseEntity, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { SkillTag } from "./SkillTag.js";
import { VoluntaryWork } from "./VoluntaryWork.js";

@Entity()
export class VolunteerProfile extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: ['Morning', 'Afternoon'],
        nullable: false
    })
    availableTime: ('Morning' | 'Afternoon')[];

    @Column({
        type: 'enum',
        enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        nullable: false
    })
    availableDays: ('Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[];

    @Column({ nullable: false })
    availableLocation: string;

    @Column({ nullable: false, type:"json" })
    preferredActivities: string[];

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