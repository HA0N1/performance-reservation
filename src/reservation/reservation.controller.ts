import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateReservationDto } from 'src/performance/dto/create-reservation.dto';
import { User } from 'src/user/entities/user.entity';
import { UserInfo } from 'src/user/utils/userInfo.decorator';
import { ReservationService } from './reservation.service';
import { DeleteReservationDto } from './dto/delete-reservation.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('reservation')
@ApiBearerAuth()
@ApiTags('예매')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  // 좌석 확인
  @Get('seat/:id')
  async findSeat(@Param('id') id: number) {
    return await this.reservationService.reservableSeat(id);
  }

  // 공연 예매

  @UseGuards(JwtAuthGuard)
  @Post(':id')
  async reservation(
    @Body() createReservationDto: CreateReservationDto,
    @UserInfo() user: User,
  ): Promise<any> {
    return await this.reservationService.reservation(
      createReservationDto,
      user.id,
    );
  }
  //환불
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async refoud(
    @Param('id') id: number,
    @Body()
    deleteReservationDto: DeleteReservationDto,
    @UserInfo() user: User,
  ) {
    return await this.reservationService.Cancellation(
      id,
      deleteReservationDto,
      user.id,
    );
  }

  // 전체조회
  @UseGuards(JwtAuthGuard)
  @Get('')
  async findAll(@Request() req) {
    const userId = req.user.id;
    return await this.reservationService.findAll(userId);
  }
}
