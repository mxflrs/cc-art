import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Style } from './style.entity';
import { Item } from './item.entity';

@Entity()
export class Place {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  alias: string; // I, II, III...

  @ManyToOne(() => Style, (style) => style.places, { onDelete: 'CASCADE' })
  style: Style;

  @OneToMany(() => Item, (item) => item.place, { cascade: true })
  items: Item[];
}
