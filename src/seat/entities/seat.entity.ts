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
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@Entity({
  name: 'seat',
})
export class Seat {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  /**
   * 공연 번호
   * @example 1
   */
  @IsNumber()
  @IsNotEmpty({ message: '공연 정보를 입력하세요.' })
  @Column({ type: 'int', name: 'performanceId', unsigned: true })
  performanceId: number;

  /**
   * 좌석 번호
   * @example 1
   */
  @IsNumber()
  @IsNotEmpty({ message: '좌석 번호를 입력해주세요' })
  @Column({ type: 'bigint', nullable: false })
  seatNum: number;

  /**
   * 좌석 등급
   * @example "STANDARD"
   */
  @IsEnum(Grade)
  @IsNotEmpty({ message: '좌석 등급을 지정해주세요.' })
  @Column({ type: 'enum', enum: Grade })
  grade: Grade;

  /**
   * 좌석 가격
   * @example 30000
   */
  @Column({ type: 'int', name: 'seatPrice', nullable: false })
  seatPrice: number;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToOne(() => Performance, (performance) => performance.seat, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  performance: Performance;

  @ManyToOne(() => Reservation, (reservation) => reservation.seat)
  reservation: Reservation;
}
