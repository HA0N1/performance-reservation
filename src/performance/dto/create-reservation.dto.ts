import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateReservationDto {
  @IsNumber()
  @IsNotEmpty({ message: '공연 정보를 입력하세요.' })
  performanceId: number;

  @IsNumber()
  @IsNotEmpty({ message: '수량을 입력해주세요.' })
  quantity: number;
}
