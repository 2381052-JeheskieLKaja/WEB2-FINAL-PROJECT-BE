// src/pembayaranTiket/dto/create-pembayaran-tiket.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreatePembayaranTiketDto {
  @ApiProperty({
    description: 'The ID of the User making the payment',
    example: 1,
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    description: 'The ID of the Tiket being paid for',
    example: 5,
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  tiketId: number;

  // Add other payment-specific fields here if necessary
  // e.g., payment method, transaction ID, etc.
  // @ApiProperty({ description: 'Payment Method', example: 'Credit Card'})
  // @IsString()
  // @IsNotEmpty()
  // paymentMethod: string;
}