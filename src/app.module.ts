import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthGuard } from './auth/auth.guard';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TiketModule } from './tiket/tiket.module';
import { PembayaranTiketModule } from './pembayaranTiket/pembayaran-tiket.module';
import { CheckoutModule } from './checkout/checkout.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST'),
        port: configService.get<number>('POSTGRES_PORT'),
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        ssl: {
          rejectUnauthorized: false,
        },
      }),
    }),
    AuthModule,
    UserModule,
    TiketModule,
    PembayaranTiketModule,
    CheckoutModule,
  ],
  controllers: [AppController],
  providers: [
    ConfigService,
    { provide: APP_GUARD, useClass: JwtAuthGuard }, // jgn di jadiin global // ohh okee bangg, boleh bikinin ga bang hehehee wkwkkw o g/ua rada2 luopa
    AppService,
  ],
})
export class AppModule {}
