import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from './utils/userInfo.decorator';
import { User } from './entities/user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('user')
@ApiTags('사용자')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/register')
  async createUser(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    const data = await this.userService.register(createUserDto);
    return { message: '회원가입이 완료되었습니다.', data };
  }

  @ApiBearerAuth() // swagger에서 api에 자물쇠 모양
  @UseGuards(JwtAuthGuard)
  @Get('/me')
  //커스텀 데코레이터
  async getEmail(@UserInfo() user: User) {
    console.log('UserController ~ getEmail ~ user:', user);
    const userInfoWithPoints = await this.userService.getUserAndPoints(user.id);

    return {
      nickname: userInfoWithPoints.nickname,
      point: userInfoWithPoints.point.total,
    };
  }
  @UseGuards(AuthGuard('local'))
  @Post('/login')
  async login(
    @Request() req,
    //loginUserDto는 AuthGuard가 사용하기 때문에 넣어줌
    @Body(ValidationPipe) loginUserDto: LoginUserDto,
  ) {
    return await this.userService.login(loginUserDto.email, req.user.id);
  }
  // @Post('test')
  // @UseGuards(AuthGuard('jwt'))
  // test(@UserInfo() user: User) {
  //   console.log(user);
  // }
}
