import { BaseEntity, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { VolunteerProfile } from "./VolunteerProfile.js";
import { VoluntaryWork } from "./VoluntaryWork.js";

@Entity()
export class SkillTag extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => VolunteerProfile)
  @JoinTable()
  volunteerProfiles: VolunteerProfile[];

  @ManyToMany(() => VoluntaryWork)
  @JoinTable()
  voluntaryWorks: VoluntaryWork[];

  @CreateDateColumn({
    type: 'timestamp',
    default: () => "CURRENT_TIMESTAMP(6)"
  })
  createdAt: Date;
}