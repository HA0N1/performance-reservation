import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Point } from 'src/user/entities/point.entity';
import { LocalStrategy } from 'src/auth/strategies/local.strategy';
import { JwtStrategy } from 'src/auth/jwt.strategy';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET_KEY'),
        signOptions: { expiresIn: '12h' },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Point]), // 나는 이 엔티티 쓸거야
  ],
  providers: [UserService, LocalStrategy, JwtStrategy],
  controllers: [UserController],
  exports: [TypeOrmModule.forFeature([User]), UserService],
})
export class UserModule {}
