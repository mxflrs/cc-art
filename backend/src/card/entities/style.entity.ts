import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Topic } from './topic.entity';
import { Place } from './place.entity';

@Entity()
export class Style {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  alias: string; // 1, 2, 3...

  @ManyToOne(() => Topic, (topic) => topic.styles, { onDelete: 'CASCADE' })
  topic: Topic;

  @OneToMany(() => Place, (place) => place.style, { cascade: true })
  places: Place[];
}
