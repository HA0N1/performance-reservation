import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Performance } from '../../performance/entities/performance.entity';
import { Status } from '../types/reservationStatus.type';
import { User } from 'src/user/entities/user.entity';
import { Ticket } from 'src/ticket/entities/ticket.entity';
@Entity({
  name: 'reservation',
})
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'userId' })
  userId: number;

  @Column({ type: 'int', name: 'performanceId' })
  performanceId: number;

  @Column({ type: 'int', name: 'ticketId' })
  ticketId: number;

  @Column({ type: 'enum', enum: Status, default: Status.Unused })
  status: Status;

  @Column({ type: 'bigint', nullable: false })
  totalPrice: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Performance, (performance) => performance.reservation)
  @JoinColumn({ name: 'performanceId' })
  performance: Performance;

  @OneToOne(() => User, (user) => user.reservation)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToOne(() => Ticket, (ticket) => ticket.reservation)
  @JoinColumn({ name: 'ticketId' })
  ticket: Ticket;
}
