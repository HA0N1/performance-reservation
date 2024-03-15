import { Seat } from 'src/seat/entities/seat.entity';

import { Category } from 'src/performance/types/performanceCategory.type';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

@Entity({
  name: 'performance',
})
export class Performance {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'int', name: 'userId', unsigned: true })
  userId: number;

  /**
   * 공연 제목
   * @example "최현우 마술쇼"
   */
  @IsString()
  @IsNotEmpty({ message: '제목을 입력해주세요.' })
  @Column({ type: 'varchar', nullable: false })
  title: string;

  /**
   * 공연 소개
   * @example "호그와트 교수님 최현우의 마술쇼"
   */
  @IsString()
  @IsNotEmpty({ message: '내용을 입력해주세요.' })
  @Column({ type: 'text', nullable: false })
  description: string;

  /**
   * 공연 카테고리
   * @example "consert"
   */
  @IsNotEmpty({ message: '카테고리를 지정해주세요.' })
  @IsEnum(Category)
  @Column({ type: 'enum', enum: Category, nullable: false })
  category: Category;

  /**
   * 공연 가격
   * @example 30000
   */
  @IsNotEmpty({ message: '가격을 입력해주세요.' })
  @IsNumber()
  @Column({ type: 'bigint', nullable: false })
  price: number;

  /**
   * 공연 시작시간
   * @example "2024-03-15 15:00:00"
   */
  @Type(() => Date)
  @IsNotEmpty({ message: '공연 시간을 입력해주세요.' })
  @IsDate()
  @Column({ type: 'datetime', nullable: false })
  dateTime: Date;
  /**
   * 공연 이미지
   * @example "user/download/example.jpg"
   */
  @IsOptional()
  @IsString()
  @Column({ type: 'varchar', nullable: true })
  image: string;
  /**
   * 공연 장소
   * @example "고척돔"
   */
  @IsNotEmpty({ message: '공연 장소를 입력해주세요.' })
  @IsString()
  @Column({ type: 'varchar', nullable: false })
  hall: string;

  /**
   * STANDARD 좌석
   * @example 30
   */
  @IsNotEmpty({ message: 'STANDARD 좌석 수를 지정해주세요.' })
  @IsNumber()
  @Column({ type: 'int', name: 'standardLimit', nullable: false })
  standardLimit: number;

  /**
   * ROYAL 좌석
   * @example 30
   */
  @IsNotEmpty({ message: 'ROYAL 좌석 수를 지정해주세요.' })
  @IsNumber()
  @Column({ type: 'int', name: 'royalLimit', nullable: false })
  royalLimit: number;

  /**
   * VIP 좌석
   * @example 30
   */
  @IsNotEmpty({ message: 'VIP 좌석 수를 지정해주세요.' })
  @IsNumber()
  @Column({ type: 'int', name: 'vipLimit', nullable: false })
  vipLimit: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => User, (user) => user.performance)
  @JoinColumn({ name: 'userId' })
  user: User[];

  @OneToMany(() => Reservation, (reservation) => reservation.performance)
  reservation: Reservation[];

  @OneToMany(() => Seat, (seat) => seat.performance, { onDelete: 'CASCADE' })
  seat: Seat[];
}
