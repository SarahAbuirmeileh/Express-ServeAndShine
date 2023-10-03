import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { VoluntartyWork } from "./VoluntaryWork.js";

@Entity()
export class OrganizationProfile extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 255, nullable: false })
    name: string;

    @Column({nullable: false})
    description: string;

    @OneToMany(() => VoluntartyWork, voluntartyWork => voluntartyWork.orgProfiles)
    voluntaryWork: VoluntartyWork[];

    @CreateDateColumn({
        type: 'timestamp',
        default: () => "CURRENT_TIMESTAMP(6)"
    })
    createdAt: Date;
}