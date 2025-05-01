import { ApiProperty } from '@nestjs/swagger';
import { PembayaranTiket } from '../pembayaranTiket/pembayaran-tiket.entity'; // Adjust path if needed
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity('checkout') // Maps to the 'checkout' table
export class Checkout {
  @ApiProperty({ description: 'Unique identifier for the checkout record' })
  @PrimaryGeneratedColumn()
  id: number;

  // Foreign Key column 'bayar_id' is handled by the @JoinColumn below

  @ApiProperty({ description: 'Timestamp when the checkout occurred' })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }) // Use DB default
  tanggal: Date;

  @ApiProperty({
    description: 'Total price for this checkout',
    example: 150000.0,
  })
  @Column({
    name: 'total_harga', // Explicitly name column to match migration snake_case
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: false,
  })
  total_harga: number; // TypeORM maps decimal to number

  @ApiProperty({
    description: 'Timestamp when the checkout record was created',
  })
  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @ApiProperty({
    description: 'Timestamp when the checkout record was last updated',
  })
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  // --- Relationships ---

  // One-to-One relationship with PembayaranTiket
  // This Checkout record corresponds to one specific payment record.
  @ApiProperty({
    type: () => PembayaranTiket,
    description: 'The payment record associated with this checkout',
  })
  @OneToOne(() => PembayaranTiket, (pembayaran) => pembayaran.checkout, {
    // Links to the 'checkout' property in PembayaranTiket
    nullable: false, // A checkout must be linked to a payment
    onDelete: 'CASCADE', // Matches migration behavior
  })
  @JoinColumn({ name: 'bayar_id' }) // This specifies that the FK in *this* table ('checkout') is 'bayar_id'
  pembayaran: PembayaranTiket; // The associated payment record
}
