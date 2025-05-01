import { ApiProperty } from '@nestjs/swagger';
import { User } from '../user/user.entity'; // Adjust the path if necessary
import { Tiket } from '../tiket/tiket.entity'; // Adjust the path if necessary
import { Checkout } from '../checkout/checkout.entity'; // Adjust the path if necessary

export class PembayaranTiketDTO {
  @ApiProperty({
    description: 'Unique identifier for the ticket payment record',
    example: 1,
  })
  id: number;

  @ApiProperty({ description: 'User who made the payment', type: () => User })
  user: User;

  @ApiProperty({
    description: 'Ticket associated with the payment',
    type: () => Tiket,
  })
  tiket: Tiket;

  @ApiProperty({
    description: 'Checkout information related to the payment',
    type: () => Checkout,
  })
  checkout: Checkout;

  @ApiProperty({
    description: 'Timestamp when the payment record was created',
    example: '2025-04-26T10:00:00Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Timestamp when the payment record was last updated',
    example: '2025-04-26T11:00:00Z',
  })
  updated_at: Date;
}
