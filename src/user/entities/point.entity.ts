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
import { ApiProperty } from '@nestjs/swagger';

@Entity({
  name: 'point',
})
export class Point {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'userId' })
  userId: number;

  @Column({ type: 'bigint', nullable: false })
  total: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.point, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}
