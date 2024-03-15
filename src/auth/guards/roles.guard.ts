import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { UserRole } from 'src/user/types/user-role.type';
import { ROLES_KEY } from 'src/user/utils/roles.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class RolesGuard extends JwtAuthGuard implements CanActivate {
  // property-based injection
  // 클래스 상속시 부모는 사용안 하지만 자식이 사용할 때 => 부모는 안 쓰는데 주입 해줘야 됨
  // =>property-based injection 사용 시 생성자를 안 써도 의존성 주입이 가넝 (=부모 주입 안해도 구현 가능)
  @InjectRepository(User) private readonly userRepository: Repository<User>;
  constructor(private reflector: Reflector) {
    super();
  }
  // canActivate에서 return true가 나와야 다음 동작을 한다!
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 인증이 잘 됐는지 확인부터 해야됨
    const auththenticated = await super.canActivate(context);

    if (!auththenticated)
      throw new UnauthorizedException('인증 정보가 잘못되었습니다.');
    // ROLES_KEY(키)에 해당하는 값을 찾아 requiredRoles에 할당
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    // 사용자의 Role과 일치하는지
    const req = context.switchToHttp().getRequest();
    const userId = req.user.id;
    const user = await this.userRepository.findOneBy({ id: userId });
    const hasPermission = requiredRoles.some((role) => role === user.role);

    return hasPermission;
  }
}
