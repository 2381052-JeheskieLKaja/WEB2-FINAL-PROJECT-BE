import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PembayaranTiketController } from './pembayaran-tiket.controller';
import { PembayaranTiketService } from './pembayaran-tiket.service';
import { PembayaranTiket } from './pembayaran-tiket.entity';
import { User } from '../user/user.entity';
import { Tiket } from '../tiket/tiket.entity';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule untuk AuthGuard('jwt')

@Module({
  imports: [
    TypeOrmModule.forFeature([PembayaranTiket, User, Tiket]), // Biar repository pembayaran tiket bisa di-inject
    AuthModule, // Karena PembayaranTiketController pakai AuthGuard('jwt')
  ],
  controllers: [PembayaranTiketController],
  providers: [PembayaranTiketService],
  exports: [PembayaranTiketService], // Export kalau butuh diakses module lain
})
export class PembayaranTiketModule {}
