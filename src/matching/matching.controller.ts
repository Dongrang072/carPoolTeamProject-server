import { Controller, Post, Get, Body, Param, HttpException, HttpStatus, Headers, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MatchingService } from './matching.service';
import { MatchingRequest } from './matching.interface';

@Controller('matching')
export class MatchingController {
  private readonly logger = new Logger(MatchingController.name);

  constructor(
    private readonly matchingService: MatchingService,
    private readonly jwtService: JwtService
  ) {}

  private decodeToken(authHeader: string) {
    try {
      const token = authHeader.split(' ')[1]; // Bearer token 형식에서 token 부분만 추출
      const decoded = this.jwtService.decode(token);
      return decoded;
    } catch (error) {
      this.logger.error('토큰 디코딩 실패:', error);
      return null;
    }
  }

  @Post('request')
  async requestMatching(
    @Headers('authorization') authHeader: string,
    @Body() request: MatchingRequest
  ) {
    try {
      this.logger.log('=== 매칭 요청 받음 ===');

      // 토큰 디코딩 및 페이로드 로깅
      const decodedToken = this.decodeToken(authHeader);
      this.logger.log('Token Payload:', JSON.stringify(decodedToken, null, 2));

      // 요청 데이터 로깅
      this.logger.log('Request Data:', {
        startPoint: request.startPoint,
        endPoint: request.endPoint,
        requestTime: request.requestTime,
        userId: decodedToken?.id  // 토큰에서 추출한 사용자 ID
      });

      return await this.matchingService.createMatching(request);
    } catch (error) {
      this.logger.error('매칭 요청 처리 중 에러 발생:', error);
      throw new HttpException(
        error.message || '매칭 요청 처리 중 오류가 발생했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('cancel/:matchId')
  async cancelMatching(
    @Headers('authorization') authHeader: string,
    @Param('matchId') matchId: string
  ) {
    try {
      this.logger.log('=== 매칭 취소 요청 받음 ===');

      const decodedToken = this.decodeToken(authHeader);
      this.logger.log('Token Payload:', JSON.stringify(decodedToken, null, 2));
      this.logger.log('Cancel Request:', {
        matchId,
        userId: decodedToken?.id
      });

      return await this.matchingService.cancelMatching(matchId);
    } catch (error) {
      this.logger.error('매칭 취소 처리 중 에러 발생:', error);
      throw new HttpException(
        error.message || '매칭 취소 처리 중 오류가 발생했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('status/:matchId')
  async getMatchingStatus(
    @Headers('authorization') authHeader: string,
    @Param('matchId') matchId: string
  ) {
    try {
      this.logger.log('=== 매칭 상태 조회 요청 받음 ===');

      const decodedToken = this.decodeToken(authHeader);
      this.logger.log('Token Payload:', JSON.stringify(decodedToken, null, 2));
      this.logger.log('Status Request:', {
        matchId,
        userId: decodedToken?.id
      });

      return await this.matchingService.getMatchingStatus(matchId);
    } catch (error) {
      this.logger.error('매칭 상태 확인 중 에러 발생:', error);
      throw new HttpException(
        error.message || '매칭 상태 확인 중 오류가 발생했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
