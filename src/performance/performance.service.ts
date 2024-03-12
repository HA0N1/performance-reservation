import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreatePerformanceDto } from './dto/create-performance.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { Performance } from './entities/performance.entity';
import _ from 'lodash';
import { User } from 'src/user/entities/user.entity';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { Point } from 'src/point/entities/point.entity';
import { Seat } from 'src/seat/entities/seat.entity';
import { CreateSeatDto } from './dto/create-seat.dto';
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
    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,
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
      userId: +id,
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

  /**예매하기 transaction */
  async reservation(
    createReservationDto: CreateReservationDto,
    userId: number,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('READ COMMITTED');
    try {
      // 공연 존재 여부
      const performance = await this.verifyPerformanceById(
        createReservationDto.performanceId,
      );
      if (_.isNil(performance))
        throw new NotFoundException('존재하지 않는 공연입니다.');

      // 1. 공연의 좌석 만들기
      let availableStandard: Array<any> = [];
      let availableRoyal: Array<any> = [];
      let availablevip: Array<any> = [];

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
          createReservationDto.performanceId,
          i + 1,
          'STANDARD',
          performance.price,
        );
        availableStandard.push(standard);
        await this.seatRepository.insert({
          performanceId: availableStandard[i].performanceId,
          seatNum: availableStandard[i].seatNum,
          grade: availableStandard[i].grade,
          seatPrice: availableStandard[i].price,
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
        availableRoyal.push(royal);
        await this.seatRepository.insert({
          performanceId: availableRoyal[i].performanceId,
          seatNum: availableRoyal[i].seatNum,
          grade: availableRoyal[i].grade,
          seatPrice: availableRoyal[i].price,
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
        availablevip.push(vip);
        await this.seatRepository.insert({
          performanceId: availablevip[i].performanceId,
          seatNum: availablevip[i].seatNum,
          grade: availablevip[i].grade,
          seatPrice: availablevip[i].price,
        });
      }

      //  TODO: 좌석을 지정하여 예매하기
      //  TODO: 동시성 처리하기
      //  TODO: 예매 확인하기

      /*
       * 1. ticket table 데이터 생성.
       * - 예매 가능 조회 -> 자리 예약 -> point 조회 -> 차감 -> ticket 데이터 생성

       * - userId, performanceId, (seatId), price, quantity
       */
      // const user = await this.getUserAndPoints(userId);

      // let point = user.point.total;
      // const out = performance.price * createReservationDto.quantity;
      // const newPointTotal = point - out;

      // if (newPointTotal < 0) {
      //   throw new BadRequestException('포인트가 부족합니다.');
      // }

      // user.point.total = newPointTotal;

      // await queryRunner.manager.save(user);

      // const ticket = this.ticketRepository.create({
      //   ...createReservationDto,
      //   userId: user.id,
      //   price: performance.price,
      // });
      // await queryRunner.manager.save(ticket);

      // console.log('예매가 완료되었습니다.');
      await queryRunner.commitTransaction();
      /**
       * 2. reservation 데이터 생성
       * - totalPrice = price * quantity
       */
      /**
       * 3. reservation Table totalPrice만큼 point Table의 outcome + => total -= outcome
       */
    } catch (err) {
      console.log(err);
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
