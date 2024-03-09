import { Body, Controller, Post } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { CreatePerformanceDto } from './dto/create-performance.dto';

@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}
  @Post('/')
  async createPerformance(@Body() createPerformanceDto: CreatePerformanceDto) {
    return await this.performanceService.create(createPerformanceDto);
  }
}
