import { IsDate, IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { Grade } from '../../seat/types/seat-grade.type';

export class CreateSeatDto {
  @IsNumber()
  @IsNotEmpty({ message: '가격을 입력해주세요.' })
  performanceId: number;

  @IsNumber()
  @IsNotEmpty({ message: '좌석번호를 입력해주세요' })
  seatNum: number;

  @IsEnum(Grade)
  @IsNotEmpty({ message: '카테고리를 지정해주세요.' })
  grade: Grade;

  @IsNumber()
  @IsNotEmpty({ message: '가격을 입력해주세요.' })
  price: number;
}
