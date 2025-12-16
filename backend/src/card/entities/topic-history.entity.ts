import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class TopicHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  topicId: number;

  @Column()
  topicName: string;

  @Column()
  event: string; // 'DELETED' | 'REINDEXED'

  @Column()
  oldAlias: string;

  @Column({ nullable: true })
  newAlias: string;

  @Column({ type: 'jsonb', nullable: true })
  details: any;

  @CreateDateColumn()
  createdAt: Date;
}
