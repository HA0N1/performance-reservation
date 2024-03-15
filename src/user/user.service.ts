import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import _ from 'lodash';
import { LoginUserDto } from './dto/login-user.dto';
import { compare, hash } from 'bcrypt';
import { Point } from 'src/user/entities/point.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) // user 리포지토리 가져오기
    private userRepository: Repository<User>, // 생성자 안에 private로 있으면 하나의 클래스로 정의! 타입은 Repository의 User
    @InjectRepository(Point)
    private pointRepository: Repository<Point>, // point 리포지토리 가져오기
    private readonly jwtService: JwtService, // JWT 토큰 생성을 위해 주입한 서비스
  ) {}

  //회원가입
  async register(createUserDto: CreateUserDto) {
    const { email, password, nickname, role } = createUserDto;
    const existingUser = await this.findByEmail(email); // 유저가 있는지 확인하기.
    if (!_.isNil(existingUser))
      throw new ConflictException('이미 가입된 email입니다.');

    const hashedPassword = await hash(createUserDto.password, 10); // 비번 해쉬화
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      nickname,
      role,
    });
    await this.userRepository.save(user);
    const point = this.pointRepository.create({
      user,
      total: Number(1000000),
    });
    await this.pointRepository.save(point);
    return { message: '회원 가입이 완료되었습니다' };
  }
  // 로그인
  async login(email: string, id: number): Promise<any> {
    // 로그인 성공 후 JWT 토큰 생성
    // header (token type) / payload (data) / signature (secret key)
    const payload = { email, id };
    const accessToken = await this.jwtService.signAsync(payload); // 알아서 시크릿키랑 페이로드 섞어서 만들어줌
    return { accessToken };
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOneBy({ email });
  }
  // 프로필 조회
  async getUserAndPoints(userId: number) {
    return await this.userRepository.findOne({
      where: { id: userId },
      relations: ['point'], // 'point' 관계를 포함하여 가져옴
    });
  }

  // 그로스 : passport-local를 위한 유저 인증
  async validateUser({ email, password }: LoginUserDto) {
    /**
     * 그로스 : findOneBy는 select를 사용 못함
      => entity에서 password를 select : false했기 때문에 password를 가지고 오지 못함
      => DB PW와 로그인PW 비교 불가
     */
    const user = await this.userRepository.findOne({
      where: { email },
      select: { id: true, password: true },
    });
    if (_.isNil(user)) {
      throw new NotFoundException('이메일을 확인해주세요.');
    }

    if (!(await compare(password, user.password))) {
      throw new UnauthorizedException('비밀번호를 확인해주세요.');
    }
    // user? => user가 없어도 오류 없이 undefined 반환.
    // ?? '' => 널병합 연산자 user?.password가 null or undefined 일 시 빈 문자열 반환
    const isPasswordMatchd = compare(password, user?.password ?? '');
    if (!user || !isPasswordMatchd) {
      return null;
    }
    return { id: user.id };
  }
}
