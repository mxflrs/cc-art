import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Place } from './place.entity';

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'float', nullable: true })
  width: number;

  @Column({ type: 'float', nullable: true })
  height: number;

  @Column({ nullable: true })
  imageUrl: string;

  @ManyToOne(() => Place, (place) => place.items, { onDelete: 'CASCADE' })
  place: Place;
}
