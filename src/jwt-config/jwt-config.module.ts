// jwt-config.module.ts
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET is not defined in environment variables');
        }

        const expiration = configService.get<string>('JWT_EXPIRATION');
        const expirationSeconds = parseInt(expiration, 10);

        if (isNaN(expirationSeconds)) {
          throw new Error('JWT_EXPIRATION must be a valid number');
        }

        console.log('JWT Configuration:', {
          secretDefined: !!secret,
          expirationSeconds,
        });

        return {
          secret,
          signOptions: {
            expiresIn: expirationSeconds,
          },
        };
      },
    }),
  ],
  exports: [JwtModule, PassportModule],
})
export class JwtConfigModule {}
