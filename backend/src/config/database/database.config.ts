import { ConfigService } from '@nestjs/config';

export function getDatabaseConfig(configService: ConfigService) {
  return {
    url: configService.get<string>('DATABASE_URL'),
    host: configService.get<string>('DATABASE_HOST'),
    port: configService.get<number>('DATABASE_PORT'),
    username: configService.get<string>('DATABASE_USER'),
    password: configService.get<string>('DATABASE_PASSWORD'),
    database: configService.get<string>('DATABASE_NAME'),
  };
}
