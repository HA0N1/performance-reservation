import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { Grade } from 'src/seat/types/seat-grade.type';

export class CreateReservationDto {
  @IsNumber()
  @IsNotEmpty({ message: '공연 정보를 입력하세요.' })
  performanceId: number;

  @IsNumber()
  @IsNotEmpty({ message: '좌석 번호를 입력해주세요' })
  seatNum: number;

  @IsEnum(Grade)
  @IsNotEmpty({ message: '좌석 등급을 지정해주세요.' })
  grade: Grade;
}
