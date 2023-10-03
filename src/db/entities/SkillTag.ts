import { BaseEntity, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { VolunteerProfile } from "./VolunteerProfile.js";
import { VoluntartyWork } from "./VoluntaryWork.js";

@Entity()
export class SkillTag extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => VolunteerProfile)
  @JoinTable()
  volunteerProfiles: VolunteerProfile[];

  @ManyToMany(() => VoluntartyWork)
  @JoinTable()
  roles: VoluntartyWork[];

  @CreateDateColumn({
    type: 'timestamp',
    default: () => "CURRENT_TIMESTAMP(6)"
  })
  createdAt: Date;
}