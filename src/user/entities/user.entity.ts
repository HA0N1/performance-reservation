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
import { Point } from './point.entity';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { UserRole } from '../types/user-role.type';

@Index('email', ['email'], { unique: true })
@Entity({
  name: 'user',
})
export class User {
  // unsigned : true => 음수 값 XX
  @PrimaryGeneratedColumn({ unsigned: true }) // auto increment
  id: number;

  /**
   * 이메일
   * @example "example@example.com"
   */
  @IsEmail()
  @IsNotEmpty({ message: '이메일을 입력해주세요.' })
  @Column({ type: 'varchar', unique: true, nullable: false })
  email: string;

  /**
   * 닉네임
   * @example "큐티춘식"
   */
  @IsString()
  @IsNotEmpty({ message: '닉네임을 입력해주세요.' })
  @Column({ type: 'varchar', nullable: false })
  nickname: string;

  /**
   * 비밀번호
   * @example "123456"
   */
  @IsString()
  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  @Column({ type: 'varchar', select: false, nullable: false })
  password: string;

  /**
   * 등급
   * @example true
   */
  @IsEnum(UserRole)
  @Column({ type: 'enum', enum: UserRole, default: UserRole.Customer })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Performance, (performance) => performance.user)
  performance: Performance;

  @OneToOne(() => Point, (point) => point.user)
  point: Point;

  @OneToMany(() => Reservation, (reservation) => reservation.user)
  reservation: Reservation[];
}
