import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Status } from '../types/seatStatus.type';
import { Performance } from '../../performance/entities/performance.entity';
import { Ticket } from 'src/ticket/entities/ticket.entity';

@Entity({
  name: 'seat',
})
export class Seat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', nullable: false })
  seatNum: number;

  @Column({ type: 'enum', enum: Status, default: Status.Sell })
  status: Status;

  @Column({ type: 'int', name: 'performanceId' })
  performanceId: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Performance, (performance) => performance.seat)
  @JoinColumn({ name: 'performanceId' })
  performance: Performance;

  @ManyToOne(() => Ticket, (ticket) => ticket.seat)
  ticket: Ticket;
}
