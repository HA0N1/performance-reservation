import { PickType } from '@nestjs/swagger';
import { Performance } from '../entities/performance.entity';

export class CreatePerformanceDto extends PickType(Performance, [
  'title',
  'description',
  'category',
  'price',
  'dateTime',
  'image',
  'hall',
  'standardLimit',
  'royalLimit',
  'vipLimit',
]) {}
