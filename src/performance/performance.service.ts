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
import { Ticket } from 'src/ticket/entities/ticket.entity';

@Injectable()
export class PerformanceService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Performance)
    private readonly performanceRepository: Repository<Performance>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) {}
  /**유저 찾기*/
  async findUser(id: number): Promise<{}> {
    const user = await this.userRepository.findOneBy({ id });
    return user;
  }
  /**공연 생성 */
  async createPerformance(
    createPerformanceDto: CreatePerformanceDto,
    id: number,
  ) {
    await this.findUser(id);
    const performance = this.performanceRepository.create({
      ...createPerformanceDto,
      userId: id,
    });
    await this.performanceRepository.save(performance);
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
    const performances = await this.findAll();
    const keywordPerformances = performances.filter((performance) =>
      performance.title.includes(title),
    );
    return keywordPerformances;
  }
  // await this.performanceRepository.find({ where: { title }});
  // return performance;

  /**공연 상세 조회 */
  async findOne(id: number) {
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
      remainedSeat: performance.remainedSeat,
    };
  }
  /**예매하기 transaction */
  async reservation(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('READ COMMITTED');
    try {
      //   // await queryRunner.manager.save(users[1]);
      const performance = await this.verifyPerformanceById(id);
      if (_.isNil(performance))
        throw new NotFoundException('존재하지 않는 공연입니다.');
      /**
       * 1. ticket table 데이터 생성.
       * - 예매 가능 좌석 정보 조회 -> 자리 예약 -> point 조회 -> 차감 -> ticket 데이터 생성
       * - 일단 좌석 지정 없이 remainedSeat 카운팅만 줄이기.
       * - userId, performanceId, (seatId), price, quantity
       */
      // const
      /**
       * 2. reservation 데이터 생성
       * - totalPrice = price * quantity
       */
      /**
       * 3. reservation Table totalPrice만큼 point Table의 outcome + => total -= outcome
       */
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  // Transaction Test
  /**퍼포먼스 찾기 */
  private async verifyPerformanceById(id: number) {
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
}
