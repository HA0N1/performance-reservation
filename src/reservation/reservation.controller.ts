import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateReservationDto } from 'src/performance/dto/create-reservation.dto';
import { User } from 'src/user/entities/user.entity';
import { UserInfo } from 'src/user/utils/userInfo.decorator';
import { ReservationService } from './reservation.service';
import { userInfo } from 'os';
import { DeleteReservationDto } from './dto/delete-reservation.dto';

@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}
  // 좌석 확인
  @Get('seat/:id')
  async findSeat(@Param('id') id: number) {
    return await this.reservationService.reservableSeat(id);
  }

  // 공연 예매
  @UseGuards(AuthGuard('jwt'))
  @Post(':id')
  async reservation(
    @Body() createReservationDto: CreateReservationDto,
    @UserInfo() user: User,
  ) {
    return await this.reservationService.reservation(
      createReservationDto,
      user.id,
    );
  }
  @UseGuards(AuthGuard('jwt'))
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
}
