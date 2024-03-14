import { PickType } from '@nestjs/swagger';
import { Reservation } from '../entities/reservation.entity';

export class DeleteReservationDto extends PickType(Reservation, ['seatId']) {}
