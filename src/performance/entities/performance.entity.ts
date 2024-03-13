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

@Entity({
  name: 'performance',
})
export class Performance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'userId' })
  userId: number;

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ type: 'enum', enum: Category, default: Category.Concert })
  category: Category;

  @Column({ type: 'bigint', nullable: false })
  price: number;

  @Column({ type: 'datetime', nullable: false })
  dateTime: Date;

  @Column({ type: 'varchar', nullable: true })
  image: string;

  @Column({ type: 'varchar', nullable: false })
  hall: string;

  @Column({ type: 'int', name: 'standardLimit', nullable: false })
  standardLimit: number;

  @Column({ type: 'int', name: 'royalLimit', nullable: false })
  royalLimit: number;

  @Column({ type: 'int', name: 'vipLimit', nullable: false })
  vipLimit: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => User, (user) => user.performance)
  @JoinColumn({ name: 'userId' })
  user: User[];

  @OneToMany(() => Reservation, (reservation) => reservation.performance)
  reservation: Reservation[];

  @OneToMany(() => Seat, (seat) => seat.performance)
  seat: Seat[];
}
