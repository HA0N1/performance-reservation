import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity({
  name: 'point',
})
export class Point {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', nullable: false })
  total: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.point, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
