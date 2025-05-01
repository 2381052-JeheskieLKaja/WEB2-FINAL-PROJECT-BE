import { PembayaranTiket } from 'src/pembayaranTiket/pembayaran-tiket.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nama' })
  nama: string;

  @Column({ name: 'email' })
  email: string;

  @Column({ name: 'password_hash' })
  password: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => PembayaranTiket, (pembayaran) => pembayaran.user)
  pembayaranTikets: PembayaranTiket[];

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
