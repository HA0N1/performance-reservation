import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Performance } from '../../performance/entities/performance.entity';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { Grade } from '../types/seat-grade.type';
import { Status } from 'src/reservation/types/reservationStatus.type';

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

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Performance, (performance) => performance.seat)
  @JoinColumn({ name: 'performanceId' })
  performance: Performance;

  @ManyToOne(() => Ticket, (ticket) => ticket.seat)
  ticket: Ticket;
}
