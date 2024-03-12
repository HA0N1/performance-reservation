import { Module } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { PerformanceController } from './performance.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Performance } from './entities/performance.entity';
import { User } from 'src/user/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { Seat } from 'src/seat/entities/seat.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Performance, User, Ticket, Reservation, Seat]),
  ],
  providers: [PerformanceService],
  controllers: [PerformanceController],
})
export class PerformanceModule {}
