import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Logs extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({
        nullable:true,
    })
    userId: string;

    @Column({
        nullable:true
    })
    userName: string;

    @Column({
        nullable:true
    })
    userType: string;

    @Column({
        type: 'enum',
        enum: ['success', 'failed'],
        nullable: true
    })
    type: 'success' | 'failed';

    @Column({
        nullable:true
    })
    request: string

    @CreateDateColumn({
        type: 'timestamp',
        default: () => "CURRENT_TIMESTAMP(6)"
    })
    createdAt: Date;
}