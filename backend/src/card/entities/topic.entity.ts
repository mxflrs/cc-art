import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { Style } from './style.entity';

@Entity()
export class Topic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  alias: string; // A, B, C...

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Style, (style) => style.topic, { cascade: true })
  styles: Style[];
}
