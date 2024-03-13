import { Point } from 'src/point/entities/point.entity';

import { Performance } from '../../performance/entities/performance.entity';

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Reservation } from 'src/reservation/entities/reservation.entity';

@Index('email', ['email'], { unique: true })
@Entity({
  name: 'user',
})
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: false })
  nickname: string;

  @Column({ type: 'varchar', select: false, nullable: false })
  password: string;

  @Column({ type: 'boolean', nullable: false, default: false })
  isAdmin: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Performance, (performance) => performance.user)
  performance: Performance;

  @OneToOne(() => Point, (point) => point.user)
  point: Point;

  @OneToOne(() => Reservation, (reservation) => reservation.user)
  reservation: Reservation;
}
