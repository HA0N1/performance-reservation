import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from './utils/userInfo.decorator';
import { User } from './entities/user.entity';
import { ApiTags } from '@nestjs/swagger';

@Controller('user')
@ApiTags('사용자')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/register')
  async createUser(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return await this.userService.register(createUserDto);
  }

  @Post('/login')
  async login(@Body(ValidationPipe) loginUserDto: LoginUserDto) {
    return await this.userService.login(loginUserDto);
  }
  // @Post('test')
  // @UseGuards(AuthGuard('jwt'))
  // test(@UserInfo() user: User) {
  //   console.log(user);
  // }

  @UseGuards(AuthGuard('jwt'))
  @Get('/me')
  //커스텀 데코레이터
  async getEmail(@UserInfo() user: User) {
    const userInfoWithPoints = await this.userService.getUserAndPoints(user.id);
    return {
      nickname: userInfoWithPoints.nickname,
      point: userInfoWithPoints.point.total,
    };
  }
}
