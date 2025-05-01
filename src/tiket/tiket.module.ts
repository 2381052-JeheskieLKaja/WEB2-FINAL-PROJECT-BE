import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TiketController } from './tiket.controller';
import { TiketService } from './tiket.service';
import { Tiket } from './tiket.entity';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule untuk AuthGuard('jwt')

@Module({
  imports: [
    TypeOrmModule.forFeature([Tiket]), // Biar Tiket repository bisa di-inject
    AuthModule, // Karena TiketController pakai AuthGuard('jwt')
  ],
  controllers: [TiketController],
  providers: [TiketService],
  exports: [TiketService], // Export kalau butuh diakses module lain
})
export class TiketModule {}
