import { ApiProperty } from '@nestjs/swagger';
import { User } from '../user/user.entity'; // Adjust path if needed
import { Tiket } from '../tiket/tiket.entity'; // Adjust path - You'll need to create this entity too
import { Checkout } from '../checkout/checkout.entity'; // Adjust path - You'll need to create this entity too
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne, // Import OneToOne for the relationship to Checkout
} from 'typeorm';

@Entity('pembayaran_tiket') // Maps to the 'pembayaran_tiket' table
export class PembayaranTiket {
  @ApiProperty({
    description: 'Unique identifier for the ticket payment record',
  })
  @PrimaryGeneratedColumn()
  id: number;

  // Explicit foreign key columns
  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'tiket_id' })
  tiketId: number;

  // Timestamps
  @ApiProperty({ description: 'Timestamp when the payment record was created' })
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the payment record was last updated',
  })
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  // Relationships
  @ApiProperty({
    type: () => User,
    description: 'The user who initiated this payment',
  })
  @ManyToOne(() => User, (user) => user.pembayaranTikets, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({
    type: () => Tiket,
    description: 'The ticket this payment is for',
  })
  @ManyToOne(() => Tiket, (tiket) => tiket.pembayaranTikets, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tiket_id' })
  tiket: Tiket;

  @ApiProperty({
    type: () => Checkout,
    description: 'The checkout record associated with this payment',
  })
  @OneToOne(() => Checkout, (checkout) => checkout.pembayaran)
  checkout: Checkout;
}
