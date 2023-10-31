import { BaseEntity, BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import bcrypt from 'bcrypt';
import { Role } from "./Role.js";
import { OrganizationProfile } from "./OrganizationProfile.js";

@Entity()
export class OrganizationAdmin extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 255, nullable: false })
    name: string;

    @Column({ nullable: false, unique:true })
    email: string;

    @BeforeInsert()
    async hashPassword() {
        if (this.password) {
            this.password = await bcrypt.hash(this.password, 10)
        }
    }
    @Column({ nullable: false })
    password: string;

    @Column({
        type: 'enum',
        enum: ['male', 'female'],
        nullable: true
    })
    gender: 'male' | 'female'

    @OneToOne(() => OrganizationProfile, {cascade: true, onDelete:"SET NULL", onUpdate:"CASCADE"})
    @JoinColumn()
    orgProfile: OrganizationProfile;

    @ManyToOne(() => Role, role => role.orgAdmins)
    roles: Role;

    @CreateDateColumn({
        type: 'timestamp',
        default: () => "CURRENT_TIMESTAMP(6)"
    })
    createdAt: Date;
}