import { Injectable } from '@nestjs/common';
import { MatchingRequest, MatchingResponse } from './matching.interface';

@Injectable()
export class MatchingService {
  private matchingRequests = new Map<string, MatchingRequest & { status: string }>();

  async createMatching(request: MatchingRequest): Promise<MatchingResponse> {
    const matchId = Date.now().toString();

    this.matchingRequests.set(matchId, {
      ...request,
      status: 'pending'
    });

    return {
      matchId,
      status: 'pending',
      message: '매칭 요청이 등록되었습니다.'
    };
  }

  async cancelMatching(matchId: string): Promise<MatchingResponse> {
    if (!this.matchingRequests.has(matchId)) {
      throw new Error('해당하는 매칭 요청을 찾을 수 없습니다.');
    }

    this.matchingRequests.delete(matchId);

    return {
      matchId,
      status: 'canceled',
      message: '매칭이 취소되었습니다.'
    };
  }

  async getMatchingStatus(matchId: string): Promise<MatchingResponse> {
    const matching = this.matchingRequests.get(matchId);

    if (!matching) {
      throw new Error('해당하는 매칭 요청을 찾을 수 없습니다.');
    }

    return {
      matchId,
      status: matching.status as 'pending' | 'matched' | 'canceled',
      message: '매칭 상태를 조회했습니다.'
    };
  }
}
