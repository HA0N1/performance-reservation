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
    const { email, password, nickname, isAdmin } = createUserDto;
    const existingUser = await this.findByEmail(email); // 유저가 있는지 확인하기.
    if (!_.isNil(existingUser))
      throw new ConflictException('이미 가입된 email입니다.');

    const hashedPassword = await hash(createUserDto.password, 10); // 비번 해쉬화
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      nickname,
      isAdmin,
    });
    await this.userRepository.save(user);
    const point = this.pointRepository.create({
      userId: user.id,
      total: Number(1000000),
    });
    await this.pointRepository.save(point);
    return { message: '회원가입이 완료되었습니다.' };
  }
  // 로그인
  async login(loginUserDto: LoginUserDto): Promise<any> {
    const { email, password } = loginUserDto;
    /**
     * 그로스 : findOneBy는 select를 사용 못함
      => entity에서 password를 select : false했기 때문에 password를 가지고 오지 못함
      => DB PW와 로그인PW 비교 불가
     */

    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'password'], // entity에서 password를 select : false 했기 때문에 직접 골라줘야함.
    });
    // 이메일로 조회했는데 존재하지 않을때
    if (_.isNil(user)) {
      throw new NotFoundException('이메일을 확인해주세요.');
    }

    if (!(await compare(password, user.password))) {
      throw new UnauthorizedException('비밀번호를 확인해주세요.');
    }

    //로그인 성공 후 JWT 토큰 생성
    // header (token type) / payload (data) / signature (secret key)
    const payload = { email, id: user.id };
    const accessToken = await this.jwtService.signAsync(payload); // 알아서 시크릿키랑 페이로드 섞어서 만들어줌
    return { id: user.id, accessToken };
  }

  async findByEmail(email: string): Promise<{}> {
    return await this.userRepository.findOneBy({ email });
  }
  // 프로필 조회
  async getUserAndPoints(userId: number) {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['point'],
    });
  }
}
