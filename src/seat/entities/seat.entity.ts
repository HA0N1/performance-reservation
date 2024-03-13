import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Performance } from '../../performance/entities/performance.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { Grade } from '../types/seat-grade.type';

@Entity({
  name: 'seat',
})
export class Seat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'performanceId' })
  performanceId: number;

  @Column({ type: 'bigint', nullable: false })
  seatNum: number;

  @Column({ type: 'enum', enum: Grade })
  grade: Grade;

  @Column({ type: 'int', name: 'seatPrice', nullable: false })
  seatPrice: number;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToOne(() => Performance, (performance) => performance.seat)
  @JoinColumn({ name: 'performanceId' })
  performance: Performance;

  @ManyToOne(() => Reservation, (reservation) => reservation.seat)
  reservation: Reservation;
}
