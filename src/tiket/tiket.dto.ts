import { ApiProperty } from '@nestjs/swagger';

export class TiketDTO {
  @ApiProperty({ description: 'Unique identifier for the ticket/event', example: 1 })
  id: number;

  @ApiProperty({ description: 'Location of the event', example: 'Gelora Bung Karno' })
  lokasi: string;

  @ApiProperty({ description: 'Price of the ticket', example: 150000.00 })
  harga: number;

  @ApiProperty({ description: 'Name of the event/ticket', example: 'Jakarta Marathon 10K' })
  nama: string;

  @ApiProperty({ description: 'Date and time of the event', example: '2024-12-15T07:00:00Z' })
  tanggal: Date;

  @ApiProperty({ description: 'Timestamp when the ticket record was created' })
  created_at: Date;

  @ApiProperty({ description: 'Timestamp when the ticket record was last updated' })
  updated_at: Date;
}
