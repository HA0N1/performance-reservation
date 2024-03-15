import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { CreatePerformanceDto } from './dto/create-performance.dto';
import { UserInfo } from 'src/user/utils/userInfo.decorator';
import { User } from 'src/user/entities/user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/user/types/user-role.type';
import { Roles } from 'src/user/utils/roles.decorator';

@Controller('performance')
@ApiTags('공연')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  // 공연 생성

  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('/registration')
  // @UseInterceptors(FileInterceptor('file'))
  async createPerformance(
    // @UploadedFile() file: Express.Multer.File,
    @Body() createPerformanceDto: CreatePerformanceDto,
    @UserInfo() user: User,
  ) {
    console.log('PerformanceController ~ user:', user);
    await this.performanceService.findUser(user.id);
    const performance = await this.performanceService.createPerformance(
      // file,
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
}
