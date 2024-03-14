import { Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Reservation } from './entities/reservation.entity';
import { Seat } from 'src/seat/entities/seat.entity';
import { Point } from 'src/user/entities/point.entity';
import { PerformanceService } from 'src/performance/performance.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Performance, User, Reservation, Seat, Point]),
  ],
  providers: [ReservationService, PerformanceService],
  controllers: [ReservationController],
})
export class ReservationModule {}
