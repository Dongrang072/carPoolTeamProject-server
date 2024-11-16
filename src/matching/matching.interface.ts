export interface MatchingRequest {
  startPoint: number;
  endPoint: number;
  requestTime: string;
}

export interface MatchingResponse {
  matchId: string;
  status: 'pending' | 'matched' | 'canceled';
  message: string;
}
