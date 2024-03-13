import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Performance } from '../../performance/entities/performance.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { Seat } from 'src/seat/entities/seat.entity';
import { User } from 'src/user/entities/user.entity';

@Entity({
  name: 'ticket',
})
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'performanceId' })
  performanceId: number;

  @Column({ type: 'int', name: 'seatId' })
  seatId: number;

  @Column({ type: 'int', name: 'userId' })
  userId: number;

  @Column({ type: 'bigint', nullable: false })
  price: number;

  @ManyToOne(() => Performance, (performance) => performance.ticket)
  @JoinColumn({ name: 'performanceId' })
  performance: Performance;

  @OneToOne(() => Reservation, (reservation) => reservation.ticket)
  reservation: Reservation;

  @OneToMany(() => Seat, (seat) => seat.ticket)
  @JoinColumn({ name: 'seatId' })
  seat: Seat;

  @OneToMany(() => User, (user) => user.ticket)
  @JoinColumn({ name: 'userId' })
  user: User[];
}
