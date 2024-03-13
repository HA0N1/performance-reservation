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
import { Grade } from 'src/seat/types/seat-grade.type';
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
    @InjectRepository(Point)
    private readonly pointRepository: Repository<Point>,
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
    const performances = await this.findAll();
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
    const performance = await this.verifyPerformanceById(id);
    if (_.isNil(performance))
      throw new NotFoundException('존재하지 않는 공연입니다.');
    // let reservableStandard: Array<any> = [];
    // let reservableRoyal: Array<any> = [];
    // let reservableVip: Array<any> = [];
    // let standardSeat = seat.filter(
    //   (standard) =>
    //     standard.performanceId === performance.id &&
    //     standard.grade === 'STANDARD' &&
    //     standard.deletedAt === null,
    // );
    // for (let i = 0; i < standardSeat.length; i++) {
    //   reservableStandard.push(standardSeat[i]);
    // }
    // console.log('STANDARD 남은 좌석 :', reservableStandard);
    // let royalSeat = seat.filter(
    //   (royal) =>
    //     royal.performanceId === performance.id &&
    //     royal.grade === 'ROYAL' &&
    //     royal.deletedAt === null,
    // );
    // for (let i = 0; i < royalSeat.length; i++) {
    //   reservableRoyal.push(royalSeat[i].seatNum);
    // }
    // console.log('ROYAL 남은 좌석 :', reservableRoyal);
    // let VipSeat = seat.filter(
    //   (vip) =>
    //     vip.performanceId === performance.id &&
    //     vip.grade === 'VIP' &&
    //     vip.deletedAt === null,
    // );
    // for (let i = 0; i < standardSeat.length; i++) {
    //   reservableVip.push(VipSeat[i].seatNum);
    // }
    // console.log('VIP 남은 좌석 :', reservableVip);
    // 예매 가능 좌석 조회
    const seats = await this.seatRepository.find({
      where: { deletedAt: null },
      select: ['performanceId', 'seatNum', 'grade', 'seatPrice'],
    });

    return seats;
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
      const seats = await this.reservableSeat(performance.id);
      let matchingSeat;
      for (const seat of seats) {
        if (
          seat.seatNum == createReservationDto.seatNum &&
          seat.performanceId === createReservationDto.performanceId &&
          seat.grade === createReservationDto.grade
        ) {
          matchingSeat = seat;
          break;
        }
      }
      if (!matchingSeat) {
        throw new NotFoundException('해당하는 좌석이 없습니다.');
      }
      // 포인트 확인
      const user = await this.getUserAndPoints(userId);

      const point = await this.pointRepository.findOne({
        where: { userId },
      });
      if (point.total < matchingSeat.seatPrice) {
        throw new BadRequestException('포인트가 부족합니다.');
      }
      const totalPoint = point.total - matchingSeat.seatPrice;
      console.log('PerformanceService ~ totalPoint:', totalPoint);
      point.total = totalPoint;
      await queryRunner.manager.save(point);

      // this.seatRepository.softDelete(matchingSeat);

      // point 조회 후 차감
      // ticket table 데이터 생성
      /*
       * 1. ticket table 데이터 생성. - userId, performanceId, (seatId), price, quantity
       * - 예매 가능 조회 -> 자리 예약 -> point 조회 -> 차감 -> ticket 데이터 생성
       *
       */

      // await this.ticketRepository.insert({
      //   userId: user.id,
      //   performanceId: createReservationDto.performanceId,
      //   seatId: createReservationDto.seatNum,
      //   price: performance.price,
      // });

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
