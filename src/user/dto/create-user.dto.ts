import { PickType } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

// 그로스 : 제너럴 타입을 통해 entity에서 한 번에
// PickType은 스웨거로 가져오기
export class CreateUserDto extends PickType(User, [
  'email',
  'nickname',
  'password',
  'isAdmin',
]) {}
