import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from './utils/userInfo.decorator';
import { User } from './entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/register')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.userService.register(createUserDto);
  }
  @Post('/login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return await this.userService.login(loginUserDto);
  }
  @UseGuards(AuthGuard('jwt'))
  @Get('/me')
  async getEmail(@UserInfo() user: User) {
    const userInfoWithPoints = await this.userService.getUserAndPoints(user.id);
    return {
      nickname: userInfoWithPoints.nickname,
      point: userInfoWithPoints.point.total,
    };
  }
}
