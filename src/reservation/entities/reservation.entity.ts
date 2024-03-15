import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Performance } from '../../performance/entities/performance.entity';
import { Seat } from 'src/seat/entities/seat.entity';
import { User } from 'src/user/entities/user.entity';
import { IsNotEmpty, IsNumber } from 'class-validator';

@Entity({
  name: 'reservation',
})
export class Reservation {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'int', name: 'performanceId', unsigned: true })
  performanceId: number;

  @IsNumber()
  @IsNotEmpty({ message: '좌석 정보를 입력해주세요' })
  @Column({ type: 'int', name: 'seatId', unsigned: true })
  seatId: number;

  @Column({ type: 'int', name: 'userId', unsigned: true })
  userId: number;

  @Column({ type: 'bigint', nullable: false })
  price: number;

  @ManyToOne(() => Performance, (performance) => performance.reservation, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'performanceId' })
  performance: Performance;

  @OneToMany(() => Seat, (seat) => seat.reservation)
  @JoinColumn({ name: 'seatId' })
  seat: Seat;
  // 그로스 : 관계설정
  @ManyToOne(() => User, (user) => user.reservation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
