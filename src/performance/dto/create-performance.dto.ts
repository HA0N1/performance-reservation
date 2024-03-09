import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Category } from '../types/performanceCategory.type';
import { Type } from 'class-transformer';

export class CreatePerformanceDto {
  @IsString()
  @IsNotEmpty({ message: '제목을 입력해주세요.' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: '내용을 입력해주세요.' })
  description: string;

  @IsEnum(Category)
  @IsNotEmpty({ message: '카테고리를 지정해주세요.' })
  category: Category;

  @IsNumber()
  @IsNotEmpty({ message: '가격을 입력해주세요.' })
  price: number;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty({ message: '공연 시간을 입력해주세요.' })
  dateTime: Date;

  @IsString()
  @IsOptional()
  image: string;

  @IsString()
  @IsNotEmpty({ message: '공연 장소를 입력해주세요.' })
  hall: string;

  @IsNumber()
  @IsNotEmpty({ message: '좌석 수를 지정해주세요.' })
  remainedSeat: number;
}
