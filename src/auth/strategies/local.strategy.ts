import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UserService } from 'src/user/user.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    // LocalStrategy의 기본적인 필드명이 정해져있음.
    // https://github.com/jaredhanson/passport-local?tab=readme-ov-file#available-options
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string) {
    const user = await this.userService.validateUser({ email, password });

    if (!user) {
      throw new UnauthorizedException('일치하는 인증 정보가 없습니다.');
    }
    //req.user로 담겨서 옴!
    return user;
  }
}
