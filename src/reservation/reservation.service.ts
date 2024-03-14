import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { Seat } from 'src/seat/entities/seat.entity';
import { Point } from 'src/user/entities/point.entity';
import { DataSource, Repository } from 'typeorm';
import _ from 'lodash';
import { PerformanceService } from 'src/performance/performance.service';
import { CreateReservationDto } from 'src/performance/dto/create-reservation.dto';
import { DeleteReservationDto } from './dto/delete-reservation.dto';

@Injectable()
export class ReservationService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Performance)
    private readonly performanceRepository: Repository<Reservation>,
    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,
    @InjectRepository(Point)
    private readonly pointRepository: Repository<Point>,
    public performanceService: PerformanceService,
  ) {}

  /**공연 좌석 조회 */
  async reservableSeat(id: number) {
    // 공연 존재 여부
    const performance = await this.performanceService.verifyPerformanceById(id);
    if (_.isNil(performance))
      throw new NotFoundException('존재하지 않는 공연입니다.');

    // 예매 가능 좌석 조회
    /**
     * id 없이 반환 받고 싶은데 어떻게 할까요?
     * 함수로 돌려서 특정 요소만 받자니 다른 함수(reservation)내에서 id를 참조해요
     */
    const seats = await this.seatRepository.find({
      where: { performanceId: id, deletedAt: null },
      select: ['id', 'seatNum', 'grade', 'seatPrice'],
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
      const performance = await this.performanceService.verifyPerformanceById(
        createReservationDto.performanceId,
      );
      if (_.isNil(performance))
        throw new NotFoundException('존재하지 않는 공연입니다.');
      const seats = await this.reservableSeat(performance.id);
      let matchingSeat;
      for (const seat of seats) {
        if (
          seat.seatNum == createReservationDto.seatNum &&
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
      const user = await this.performanceService.getUserAndPoints(userId);

      const point = await this.pointRepository.findOne({
        where: { userId },
      });
      console.log('ReservationService ~ point:', point);
      if (point.total < matchingSeat.seatPrice) {
        throw new BadRequestException('포인트가 부족합니다.');
      }
      console.log('ReservationService ~ matchingSeat:', matchingSeat);

      this.seatRepository.softDelete(matchingSeat);

      const totalPoint = point.total - matchingSeat.seatPrice;
      point.total = totalPoint;
      await queryRunner.manager.save(point);
      const reservation = await this.reservationRepository.create({
        userId: user.id,
        performanceId: createReservationDto.performanceId,
        seatId: matchingSeat.id,
        price: matchingSeat.seatPrice,
      });
      await queryRunner.manager.save(reservation);
      await queryRunner.commitTransaction();
      return matchingSeat;
    } catch (err) {
      console.log(err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  /**예매 환불 */

  async Cancellation(
    id: number,
    deleteReservationDto: DeleteReservationDto,
    userId: number,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('READ COMMITTED');
    try {
      let seatId: number = deleteReservationDto.seatId;
      const seat = await this.seatRepository.findOne({
        where: { id: seatId },
        withDeleted: true,
      });
      if (seat.deletedAt === null)
        throw new BadRequestException('예매된 좌석이 아닙니다.');
      // 1. Point Repository 복구 (seat price만큼 => Reservation Repository price만큼?)
      const point: Point = await this.pointRepository.findOne({
        where: { userId },
      });
      let totalPoint: number = Number(point.total) + Number(seat.seatPrice);
      point.total = Number(totalPoint);
      await queryRunner.manager.save(point);

      // 2. Seat Repository 복구 (soft delete =>seatid를 검색해서 null 값 주기)
      await this.seatRepository.restore(seatId);

      // 3 Reservation Repository 데이터 삭제 (delete)
      await this.reservationRepository.delete({ seatId: seat.id });
      await queryRunner.commitTransaction();
      return { point: point.total };
    } catch (err) {
      console.log(err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
