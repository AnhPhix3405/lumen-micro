import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import * as fs from 'fs';
import * as path from 'path';
@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true
  }),
    UsersModule,
  TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => ({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: configService.get<string>('DB_PASSWORD'),
      database: 'lumen',
      schema: "user_service",
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    inject: [ConfigService],
  }),
  JwtModule.registerAsync({
    global: true,
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async () => ({
      publicKey: fs.readFileSync(path.join(process.cwd(), 'src/rs256key/public.pem')),
      secretOrPrivateKey: '123456',
      signOptions: {
        algorithm: 'RS256',
        expiresIn: '1h',
      },
    }),
  }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
