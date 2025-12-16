import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Place } from './place.entity';

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  alias: string;

  @Column({ type: 'float', nullable: true })
  width: number;

  @Column({ type: 'float', nullable: true })
  height: number;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  playground: any;

  @ManyToOne(() => Place, (place) => place.items, { onDelete: 'CASCADE' })
  place: Place;

  @CreateDateColumn()
  createdAt: Date;
}
