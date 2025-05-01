import { ApiProperty } from '@nestjs/swagger';
import { PembayaranTiket } from '../pembayaranTiket/pembayaran-tiket.entity'; // Adjust path if needed
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('tiket') // Maps to the 'tiket' table
export class Tiket {
  @ApiProperty({ description: 'Unique identifier for the ticket/event' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Location of the event',
    example: 'Gelora Bung Karno',
  })
  @Column({ type: 'varchar', length: 255, nullable: false })
  lokasi: string;

  @ApiProperty({ description: 'Price of the ticket', example: 150000.0 })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false }) // Use decimal for currency
  harga: number; // TypeORM maps decimal to number in TypeScript

  @ApiProperty({
    description: 'Name of the event/ticket',
    example: 'Jakarta Marathon 10K',
  })
  @Column({ type: 'varchar', length: 150, nullable: false })
  nama: string;

  @ApiProperty({
    description: 'Date and time of the event',
    example: '2024-12-15T07:00:00Z',
  })
  @Column({ type: 'timestamp', nullable: false }) // Stores date and time
  tanggal: Date;

  @ApiProperty({ description: 'Timestamp when the ticket record was created' })
  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @ApiProperty({
    description: 'Timestamp when the ticket record was last updated',
  })
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  // --- Relationships ---

  // One-to-Many relationship with PembayaranTiket
  // One ticket can be part of many payment records
  @OneToMany(() => PembayaranTiket, (pembayaran) => pembayaran.tiket)
  pembayaranTikets: PembayaranTiket[]; // Collection of payments for this ticket
}
