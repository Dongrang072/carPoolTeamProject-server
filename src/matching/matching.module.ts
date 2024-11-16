import { Module } from '@nestjs/common';
import { MatchingController } from './matching.controller';
import { MatchingService } from './matching.service';
import { JwtConfigModule } from '../jwt-config/jwt-config.module';

@Module({
  imports: [JwtConfigModule], // JwtConfigModule을 추가
  controllers: [MatchingController],
  providers: [MatchingService],
})
export class MatchingModule {}
