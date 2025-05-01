// src/checkout/dto/create-checkout.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateCheckoutDto {
  @ApiProperty({
    description: 'The ID of the PembayaranTiket record this checkout relates to',
    example: 123,
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  pembayaranId: number;

  @ApiProperty({
    description: 'The total price calculated for this checkout',
    example: 150000.00,
  })
  @IsNumber({ maxDecimalPlaces: 2 }) // Ensure it's a number, allow up to 2 decimal places
  @Min(0) // Price cannot be negative
  @IsNotEmpty()
  total_harga: number;

  // The 'tanggal' field in the entity has a default value (CURRENT_TIMESTAMP),
  // so it's often not needed in the Create DTO unless you want to override it.
  // If you need to set it explicitly during creation:
  // @ApiProperty({ description: 'Timestamp of the checkout (optional, defaults to now)', example: '2024-08-17T10:00:00Z', required: false })
  // @IsOptional()
  // @IsDateString()
  // tanggal?: Date;
}