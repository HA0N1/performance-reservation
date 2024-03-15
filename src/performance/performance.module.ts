import { Module } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { PerformanceController } from './performance.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Performance } from './entities/performance.entity';
import { User } from 'src/user/entities/user.entity';
import { Seat } from 'src/seat/entities/seat.entity';
import { Point } from 'src/user/entities/point.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Performance, User, Reservation, Seat, Point]),
  ],
  providers: [PerformanceService],
  controllers: [PerformanceController],
  exports: [PerformanceService],
})
export class PerformanceModule {}
