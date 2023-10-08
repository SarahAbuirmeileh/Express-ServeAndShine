import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Logs extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({
        nullable:false,
    })
    userId: string;

    @Column({
        nullable:false
    })
    userName: string;

    @Column({
        nullable:false
    })
    userType: string;

    @Column({
        type: 'enum',
        enum: ['success', 'failed'],
        nullable: false
    })
    type: 'success' | 'failed';

    @Column({
        nullable:false
    })
    request: string

    @CreateDateColumn({
        type: 'timestamp',
        default: () => "CURRENT_TIMESTAMP(6)"
    })
    createdAt: Date;
}