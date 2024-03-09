import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePerformanceDto } from './dto/create-performance.dto';
import { Performance } from './entities/performance.entity';

@Injectable()
export class PerformanceService {
  constructor(
    @InjectRepository(Performance)
    private readonly performanceRepository: Repository<Performance>,
  ) {}
  async create(createPerformanceDto: CreatePerformanceDto) {
    await this.performanceRepository.save(createPerformanceDto);
  }
}
