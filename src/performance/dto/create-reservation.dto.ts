import { PickType } from '@nestjs/swagger';
import { Seat } from 'src/seat/entities/seat.entity';

export class CreateReservationDto extends PickType(Seat, [
  'performanceId',
  'seatNum',
  'grade',
]) {}
