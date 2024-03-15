import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreatePerformanceDto } from './dto/create-performance.dto';
import { Performance } from './entities/performance.entity';
import _ from 'lodash';
import { User } from 'src/user/entities/user.entity';
import { Seat } from 'src/seat/entities/seat.entity';

@Injectable()
export class PerformanceService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Performance)
    private readonly performanceRepository: Repository<Performance>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,
  ) {}
  /**유저 찾기*/
  async findUser(id: number): Promise<{}> {
    const user: User = await this.userRepository.findOneBy({ id });
    return user;
  }
  /**공연 생성 */
  async createPerformance(
    // file: Express.Multer.File,
    createPerformanceDto: CreatePerformanceDto,
    id: number,
  ) {
    // if (!file.originalname.endsWith('.csv')) {
    //   throw new BadRequestException('CSV 파일만 업로드 가능합니다.');
    // }

    // const csvContent = file.buffer.toString();

    // let parseResult;
    // try {
    //   parseResult = parse(csvContent, {
    //     header: true,
    //     skipEmptyLines: true,
    //   });
    // } catch (error) {
    //   throw new BadRequestException('CSV 파싱에 실패했습니다.');
    // }

    // const teamsData = parseResult.data as any[];

    // for (const teamData of teamsData) {
    //   if (_.isNil(teamData.name) || !teamData.description) {
    //     throw new BadRequestException(
    //       'CSV 파일은 name과 description 컬럼을 포함해야 합니다.',
    //     );
    //   }
    // }
    await this.findUser(id);
    const performance: Performance = this.performanceRepository.create({
      ...createPerformanceDto,
      userId: +id,
    });
    await this.performanceRepository.save(performance);
    await this.setSeat(performance.id);
    return performance;
  }
  /**공연 전체 */
  async findAll(): Promise<Performance[]> {
    return await this.performanceRepository.find({
      select: ['id', 'title', 'category', 'dateTime', 'hall'],
    });
  }
  /**공연 키워드 */
  async findByKeyword(title: string) {
    const performances: Array<Performance> = await this.findAll();
    const keywordPerformances = performances.filter((performance) =>
      performance.title.includes(title),
    );
    return keywordPerformances;
  }

  /**공연 상세 조회 */
  async findOne(id: number): Promise<{}> {
    if (_.isNaN(id))
      throw new BadRequestException('공연 ID의 형식이 잘못되었습니다.');
    const performance = await this.verifyPerformanceById(id);
    if (_.isNil(performance))
      throw new BadRequestException('존재하지 않는 공연입니다.');
    return {
      title: performance.title,
      description: performance.description,
      price: performance.price,
      image: performance.image,
      standardLimit: performance.standardLimit,
      royalLimit: performance.royalLimit,
      vipLimit: performance.vipLimit,
    };
  }
  async getUserAndPoints(userId: number): Promise<User> {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['point'],
    });
  }
  /**공연 좌석 조회 */
  async reservableSeat(id: number) {
    // 공연 존재 여부
    const performance: Performance = await this.verifyPerformanceById(id);
    if (_.isNil(performance))
      throw new NotFoundException('존재하지 않는 공연입니다.');

    // 예매 가능 좌석 조회
    const seats = await this.seatRepository.find({
      where: { performanceId: id, deletedAt: null },
      select: ['seatNum', 'grade', 'seatPrice'],
    });

    return seats;
  }

  // Transaction Test
  /**퍼포먼스 찾기 */
  async verifyPerformanceById(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction('READ COMMITTED');
    try {
      const performance = await queryRunner.manager
        .getRepository(Performance)
        .findOneBy({ id });
      if (_.isNil(performance)) {
        throw new NotFoundException('존재하지 않는 공연입니다.');
      }

      await queryRunner.commitTransaction();
      return performance;
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
  // 좌석 생성
  async setSeat(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('READ COMMITTED');
    try {
      // 공연 존재 여부
      const performance = await this.verifyPerformanceById(id);
      if (_.isNil(performance))
        throw new NotFoundException('존재하지 않는 공연입니다.');

      // 1. 공연의 좌석 만들기
      let setSeatStandard: Array<any> = [];
      let setSeatRoyal: Array<any> = [];
      let setSeatvip: Array<any> = [];

      class SeatSet {
        performanceId: number;
        seatNum: number;
        grade: string;
        price: number;
        constructor(
          performanceId: number,
          seatNum: number,
          grade: string,
          price: number,
        ) {
          this.performanceId = performanceId;
          this.grade = grade;
          this.seatNum = seatNum;
          this.price = price;
        }
      }
      // 스탠다드
      for (let i = 0; i < performance.standardLimit; i++) {
        const standard = new SeatSet(
          performance.id,
          i + 1,
          'STANDARD',
          performance.price,
        );
        setSeatStandard.push(standard);
        await this.seatRepository.insert({
          performanceId: setSeatStandard[i].performanceId,
          seatNum: setSeatStandard[i].seatNum,
          grade: setSeatStandard[i].grade,
          seatPrice: setSeatStandard[i].price,
        });
      }

      // 로얄
      for (let i = 0; i < performance.standardLimit; i++) {
        const royal = new SeatSet(
          performance.id,
          i + 1,
          'ROYAL',
          performance.price * 1.5,
        );
        setSeatRoyal.push(royal);
        await this.seatRepository.insert({
          performanceId: setSeatRoyal[i].performanceId,
          seatNum: setSeatRoyal[i].seatNum,
          grade: setSeatRoyal[i].grade,
          seatPrice: setSeatRoyal[i].price,
        });
      }

      // 뷥
      for (let i = 0; i < performance.standardLimit; i++) {
        const vip = new SeatSet(
          performance.id,
          i + 1,
          'VIP',
          performance.price * 2,
        );
        setSeatvip.push(vip);
        await this.seatRepository.insert({
          performanceId: setSeatvip[i].performanceId,
          seatNum: setSeatvip[i].seatNum,
          grade: setSeatvip[i].grade,
          seatPrice: setSeatvip[i].price,
        });
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      console.log(err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
