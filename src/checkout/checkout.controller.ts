// src/checkout/checkout.controller.ts

import {
    Controller,
    Get,
    Post,
    Put, // <-- Import Put
    Delete, // <-- Import Delete
    Body,
    Logger,
    NotFoundException,
    Param,
    ParseIntPipe,
    UseGuards,
    UsePipes,
    ValidationPipe,
    ConflictException,
    BadRequestException,
    HttpCode, // <-- Import HttpCode
  } from '@nestjs/common';
  import { CheckoutService } from './checkout.services'; // Pastikan path benar ke service
  import { Checkout } from './checkout.entity'; // Import the entity
  import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
    ApiNotFoundResponse,
    ApiParam,
    ApiCreatedResponse,
    ApiBadRequestResponse,
    ApiConflictResponse,
    ApiBody,
    ApiNoContentResponse, // <-- Import ApiNoContentResponse
  } from '@nestjs/swagger';
  // import { Request } from 'express';
  import { CheckoutDTO } from './checkout.dto'; // DTO for response types (adjust if not using)
  import { CreateCheckoutDto } from './create-checkout.dto'; // DTO for request body
  // Disarankan: Buat DTO untuk Update
  // import { UpdateCheckoutDto } from './dto/update-checkout.dto';
  
  @ApiTags('Checkout')
  @ApiBearerAuth()
  @Controller('checkout')
  export class CheckoutController {
    private readonly logger = new Logger(CheckoutController.name);
  
    constructor(private readonly checkoutService: CheckoutService) {}
  
    // --- POST Endpoint ---
    @Post()
    @ApiOperation({ summary: 'Create a new checkout record' })
    @ApiBody({
      description:
        'Data required to create a new checkout record (requires existing PembayaranTiket ID).',
      type: CreateCheckoutDto,
    })
    @ApiCreatedResponse({
      description: 'The checkout record has been successfully created.',
      type: Checkout, // Kembalikan tipe Entity aktual dari service
    })
    @ApiBadRequestResponse({
      description:
        'Bad Request. Input data validation failed or associated PembayaranTiket not found.',
    })
    @ApiConflictResponse({
      description:
        'Conflict. A checkout record already exists for the specified PembayaranTiket ID.',
    })
    @ApiUnauthorizedResponse({
      description: 'Unauthorized. Invalid or missing token.',
    })
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async createCheckout(
      @Body() createCheckoutDto: CreateCheckoutDto,
    ): Promise<Checkout> {
      this.logger.log(
        `Attempting to create checkout record for Pembayaran ID: ${createCheckoutDto.pembayaranId}`,
      );
      try {
        const newCheckout = await this.checkoutService.create(createCheckoutDto);
        // Service sudah melempar error jika gagal, jadi tidak perlu cek null di sini
        this.logger.log(
          `Successfully created checkout record with ID: ${newCheckout.id} for Pembayaran ID: ${createCheckoutDto.pembayaranId}`,
        );
        return newCheckout; // Kembalikan Entity
      } catch (error) {
        this.logger.error(
          `Failed to create checkout for Pembayaran ID ${createCheckoutDto.pembayaranId}: ${error.message}`,
          error.stack,
        );
        // Re-throw specific HTTP exceptions caught from the service
        if (
          error instanceof ConflictException ||
          error instanceof NotFoundException || // Service melempar NotFound jika FK gagal
          error instanceof BadRequestException
        ) {
          // Ubah NotFound dari service (untuk FK) menjadi BadRequest di Controller
          if (error instanceof NotFoundException) {
             throw new BadRequestException(error.message);
          }
          throw error; // Lempar ulang Conflict atau BadRequest
        }
        // Tangkap error lain dan lempar sebagai BadRequest generik
        throw new BadRequestException(
          `Could not create checkout record. ${error.message || 'Please check input data.'}`,
        );
      }
    }
  
    // --- GET All Endpoint ---
    @Get()
    @ApiOperation({ summary: 'Get all checkout records' })
    @ApiOkResponse({
      description: 'List of all checkout records.',
      type: [Checkout], // Kembalikan tipe Entity aktual dari service
    })
    @ApiUnauthorizedResponse({
      description: 'Unauthorized. Invalid or missing token.',
    })
    async getAllCheckouts(): Promise<Checkout[]> {
      this.logger.log('Fetching all checkout records');
      const checkouts = await this.checkoutService.findAll();
      return checkouts;
    }
  
    // --- GET By ID Endpoint ---
    @Get(':id')
    @ApiOperation({ summary: 'Get a checkout record by its ID' })
    @ApiParam({
      name: 'id',
      description: 'ID of the checkout record to retrieve',
      type: Number,
    })
    @ApiOkResponse({
      description: 'Checkout record retrieved successfully.',
      type: Checkout, // Kembalikan tipe Entity aktual dari service
    })
    @ApiNotFoundResponse({ description: 'Checkout record not found.' })
    @ApiUnauthorizedResponse({
      description: 'Unauthorized. Invalid or missing token.',
    })
    async getCheckoutById(
      @Param('id', ParseIntPipe) id: number,
    ): Promise<Checkout> {
      this.logger.log(`Fetching checkout record with ID: ${id}`);
      const checkout = await this.checkoutService.findById(id);
      if (!checkout) {
        this.logger.warn(`Checkout record with ID ${id} not found.`);
        throw new NotFoundException(`Checkout record with ID ${id} not found.`);
      }
      return checkout;
    }
  
    // --- GET By Pembayaran ID Endpoint ---
    @Get('by-payment/:pembayaranId')
    @ApiOperation({
      summary: 'Get the checkout record associated with a specific payment ID',
    })
    @ApiParam({
      name: 'pembayaranId',
      description: 'ID of the associated payment record',
      type: Number,
    })
    @ApiOkResponse({
      description: 'Checkout record retrieved successfully.',
      type: Checkout, // Kembalikan tipe Entity aktual dari service
    })
    @ApiNotFoundResponse({
      description: 'Checkout record not found for the given payment ID.',
    })
    @ApiUnauthorizedResponse({
      description: 'Unauthorized. Invalid or missing token.',
    })
    async getCheckoutByPembayaranId(
      @Param('pembayaranId', ParseIntPipe) pembayaranId: number,
    ): Promise<Checkout> {
      this.logger.log(
        `Fetching checkout record for payment ID: ${pembayaranId}`,
      );
      const checkout = await this.checkoutService.findByPembayaranId(pembayaranId);
      if (!checkout) {
        throw new NotFoundException(
          `Checkout record for payment ID ${pembayaranId} not found.`,
        );
      }
      return checkout;
    }
  
    // --- PUT Endpoint (Update) ---
    @Put(':id')
    @ApiOperation({ summary: 'Update an existing checkout record (e.g., total_harga)' })
    @ApiParam({ name: 'id', description: 'ID of the checkout record to update', type: Number })
    @ApiBody({
      description: 'Data to update the checkout record with. Only specific fields like "total_harga" are typically allowed.',
      // Sangat disarankan menggunakan DTO spesifik: type: UpdateCheckoutDto
      schema: {
          type: 'object',
          properties: {
              total_harga: { type: 'number', example: 250000 },
              // JANGAN sertakan 'pembayaranId' atau 'pembayaran' di sini
          },
          required: ['total_harga'] // Sesuaikan jika field lain bisa diupdate
      }
    })
    @ApiOkResponse({ description: 'Checkout record updated successfully.', type: Checkout })
    @ApiNotFoundResponse({ description: 'Checkout record not found.' })
    @ApiBadRequestResponse({ description: 'Invalid input data or attempt to change payment association.' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized. Invalid or missing token.' })
    // Gunakan ValidationPipe untuk body, skipMissingProperties cocok untuk update parsial
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, skipMissingProperties: true }))
    async updateCheckout(
      @Param('id', ParseIntPipe) id: number,
      // Jika menggunakan DTO: @Body() updateDto: UpdateCheckoutDto
      @Body() updateData: Partial<Checkout>, // Gunakan Partial atau DTO spesifik
    ): Promise<Checkout> {
      this.logger.log(`Attempting to update checkout record with ID: ${id}`);
      try {
          // Service akan menangani logika update dan validasi (termasuk cek perubahan pembayaran)
          const updatedCheckout = await this.checkoutService.update(id, updateData);
          return updatedCheckout;
      } catch (error) {
          this.logger.error(`Failed to update checkout ID ${id}: ${error.message}`, error.stack);
          // Re-throw specific HTTP exceptions
          if (error instanceof NotFoundException || error instanceof BadRequestException) {
              throw error;
          }
          // Tangkap error lain
          throw new BadRequestException(`Could not update checkout record. ${error.message || 'Please check input data.'}`);
      }
    }
  
    // --- DELETE Endpoint ---
    @Delete(':id')
    @HttpCode(204) // <-- Set HTTP status ke 204 No Content untuk sukses DELETE
    @ApiOperation({ summary: 'Delete a checkout record by ID' })
    @ApiParam({ name: 'id', description: 'ID of the checkout record to delete', type: Number })
    @ApiNoContentResponse({ description: 'Checkout record deleted successfully.' }) // <-- Gunakan 204 response
    @ApiNotFoundResponse({ description: 'Checkout record not found.' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized. Invalid or missing token.' })
    async deleteCheckout(
      @Param('id', ParseIntPipe) id: number,
    ): Promise<void> { // <-- Return type void
      this.logger.log(`Attempting to delete checkout record with ID: ${id}`);
      try {
          // Service akan melempar NotFoundException jika ID tidak ada
          await this.checkoutService.remove(id);
          this.logger.log(`Successfully deleted checkout record with ID: ${id}`);
          // Tidak perlu return apa-apa untuk 204
      } catch (error) {
          this.logger.error(`Failed to delete checkout ID ${id}: ${error.message}`, error.stack);
          // Re-throw specific HTTP exceptions
          if (error instanceof NotFoundException) {
              throw error;
          }
          // Tangkap error lain (seharusnya jarang terjadi untuk delete by ID)
          throw new BadRequestException(`Could not delete checkout record. ${error.message || 'An unexpected error occurred.'}`);
      }
    }
  }