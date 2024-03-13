import { IsNotEmpty, IsNumber } from 'class-validator';

export class DeleteReservationDto {
  @IsNumber()
  @IsNotEmpty({ message: '좌석 정보를 입력해주세요' })
  seatId: number;
}
