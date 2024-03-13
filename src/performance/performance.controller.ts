import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { CreatePerformanceDto } from './dto/create-performance.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/user/utils/userInfo.decorator';
import { User } from 'src/user/entities/user.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { CreateSeatDto } from './dto/create-seat.dto';

@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  // 공연 생성
  @UseGuards(AuthGuard('jwt'))
  @Post('/registration')
  async createPerformance(
    @Body() createPerformanceDto: CreatePerformanceDto,
    @UserInfo() user: User,
  ) {
    await this.performanceService.findUser(user.id);
    if (!user.isAdmin)
      throw new ForbiddenException('공연을 등록할 권한이 없습니다.');
    const performance = await this.performanceService.createPerformance(
      createPerformanceDto,
      user.id,
    );
    return { performanceId: performance.id };
  }
  // 공연 전체조회
  @Get('/')
  async findAll() {
    return this.performanceService.findAll();
  }

  //공연 키워드 조회
  @Get('/search?')
  async Keyword(@Query('keyword') keyword: string) {
    return await this.performanceService.findByKeyword(keyword);
  }

  // 공연 상세보기
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.performanceService.findOne(id);
  }
  //
  @Get('seat/:id')
  async findSeat(@Param('id') id: number) {
    return await this.performanceService.reservableSeat(id);
  }

  // 공연 예매
  @UseGuards(AuthGuard('jwt'))
  @Post(':id/reservation')
  async reservation(
    @Body() createReservationDto: CreateReservationDto,
    @UserInfo() user: User,
  ) {
    return await this.performanceService.reservation(
      createReservationDto,
      user.id,
    );
  }
}
