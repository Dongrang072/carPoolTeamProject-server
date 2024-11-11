import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { AuthCredentialDto } from './dto/auth-credential.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { AuthLoginDto } from './dto/auth-login.dto';
import { User } from './user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    // jwt 서비스 등록
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // 회원가입
  async signUp(authCredentialDto: AuthCredentialDto): Promise<void> {
    return this.userRepository.createUser(authCredentialDto);
  }

  // 로그인
  async signIn(authLoginDto: AuthLoginDto): Promise<{ accessToken: string; refreshToken: string }> {
    const { name, password } = authLoginDto;

    const user = await this.userRepository.findOne({ where: { name } });
    if (!user) {
      throw new UnauthorizedException(
        '아이디 또는 비밀번호가 일치하지 않습니다.',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        '아이디 또는 비밀번호가 일치하지 않습니다.',
      );
    }

    const payload = { name: user.name }; // 중요한 정보는 포함하지 않음
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload);
    return { accessToken , refreshToken};
  }

  async refreshToken(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { name: user.name, sub: user.id };

    // 새로운 액세스 토큰과 리프레시 토큰 생성
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // 필요한 경우 데이터베이스에 리프레시 토큰을 저장하여 유효성을 관리할 수 있습니다.
    return { accessToken, refreshToken };
  }

  async getProfile(user: User): Promise<{
    name: string;
    email: string;
    profile: { profilePicture: string; bio: string };
  }> {
    const userWithProfile = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['profile'],
    });

    if (!userWithProfile) {
      throw new BadRequestException('User profile not found');
    }

    return {
      name: userWithProfile.name,
      email: userWithProfile.email,
      profile: {
        profilePicture: userWithProfile.profile?.profilePicture || '',
        bio: userWithProfile.profile?.bio || '',
      },
    };
  }

  private async getTokens(payload: { name: string }) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'), // ConfigService를 통해 secret 가져오기
        expiresIn: this.configService.get<string>('JWT_EXPIRATION'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'), // ConfigService를 통해 secret 가져오기
        expiresIn: this.configService.get<string>('JWT_EXPIRATION'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async deleteRefreshToken(user: User) {

  }
}
