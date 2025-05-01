// src/checkout/checkout.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckoutController } from './checkout.controller'; // Import the Checkout controller
import { CheckoutService } from './checkout.services';     // Import the Checkout service
import { Checkout } from './checkout.entity';           // Import the Checkout entity
import { AuthModule } from '../auth/auth.module';       // Import AuthModule because CheckoutController uses AuthGuard('jwt')

@Module({
  imports: [
    TypeOrmModule.forFeature([Checkout]), // Make the Checkout repository injectable within this module
    AuthModule,                           // Import AuthModule as CheckoutController uses AuthGuard('jwt') provided by it
  ],
  controllers: [CheckoutController],      // Declare the controller belonging to this module
  providers: [CheckoutService],           // Declare the service belonging to this module
  exports: [CheckoutService],             // Export CheckoutService if it needs to be injected into other modules
})
export class CheckoutModule {}