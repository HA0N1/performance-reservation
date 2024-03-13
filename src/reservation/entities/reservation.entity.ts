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
import { Seat } from 'src/seat/entities/seat.entity';
import { User } from 'src/user/entities/user.entity';

@Entity({
  name: 'reservation',
})
export class Reservation {
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

  @ManyToOne(() => Performance, (performance) => performance.reservation)
  @JoinColumn({ name: 'performanceId' })
  performance: Performance;

  @OneToMany(() => Seat, (seat) => seat.reservation)
  @JoinColumn({ name: 'seatId' })
  seat: Seat;

  @OneToMany(() => User, (user) => user.reservation)
  @JoinColumn({ name: 'userId' })
  user: User[];
}
