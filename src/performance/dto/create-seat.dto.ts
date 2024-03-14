import { PickType } from '@nestjs/swagger';
import { Seat } from 'src/seat/entities/seat.entity';

export class CreateSeatDto extends PickType(Seat, ['seatNum', 'grade']) {}
