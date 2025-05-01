// src/checkout/dto/checkout.dto.ts

import { ApiProperty } from '@nestjs/swagger';
// Import the related *ENTITY* type for the @ApiProperty decorator type hint,
// following the provided reference pattern. Adjust the path as necessary.
import { PembayaranTiket } from '../pembayaranTiket/pembayaran-tiket.entity';
// If you have a PembayaranTiketDTO and want to use it for the actual property type,
// you could import and use it instead of the entity for the 'pembayaran' property type.
// import { PembayaranTiketDTO } from '../pembayaranTiket/dto/pembayaran-tiket.dto'; // Example import

export class CheckoutDTO {
  @ApiProperty({
    description: 'Unique identifier for the checkout record',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Timestamp when the checkout occurred',
    example: '2025-04-27T14:30:00Z', // Example date
  })
  tanggal: Date;

  @ApiProperty({
    description: 'Total price for this checkout',
    example: 150000.0,
  })
  total_harga: number;

  @ApiProperty({
    description: 'Timestamp when the checkout record was created',
    example: '2025-04-27T14:35:00Z', // Example date
  })
  created_at: Date;

  @ApiProperty({
    description: 'Timestamp when the checkout record was last updated',
    example: '2025-04-27T14:35:00Z', // Example date
  })
  updated_at: Date;

  // --- Relationship ---
  @ApiProperty({
    // Type hint for Swagger documentation, referencing the related *entity*.
    // This follows the pattern in your PembayaranTiketDTO reference.
    type: () => PembayaranTiket,
    description: 'The payment record associated with this checkout',
  })
  // The actual type of the property in the DTO.
  // Using the entity type here follows the reference.
  // For stricter DTO-only structures, you might prefer using PembayaranTiketDTO if available.
  pembayaran: PembayaranTiket; // Or: pembayaran: PembayaranTiketDTO;
}