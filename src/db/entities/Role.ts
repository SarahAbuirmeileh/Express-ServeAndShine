import { BaseEntity, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Permission } from "./Permission.js";
import { Volunteer } from "./Volunteer.js";
import { OrganizationAdmin } from "./OrganizationAdmin.js";

@Entity()
export class Role extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({
        type: 'enum',
        enum: ['root', 'admin', 'volunteer', 'premium'],
        default: 'volunteer',
        unique:true
    })
    name: 'root' | 'admin' | 'volunteer' | 'premium';

    @ManyToMany(() => Volunteer)
    @JoinTable()
    volunteers: Volunteer[];

    @ManyToMany(() => Permission)
    @JoinTable()
    permissions: Permission[];

    @OneToMany(() => OrganizationAdmin, organizationAdmin => organizationAdmin.roles)
    orgAdmins: OrganizationAdmin[];

    @CreateDateColumn({
        type: 'timestamp',
        default: () => "CURRENT_TIMESTAMP(6)"
    })
    createdAt: Date;
}