import {
  Controller,
  Get,
  Post,
  Put, // <-- Import Put
  Delete, // <-- Import Delete
  Body,
  Param,
  NotFoundException,
  Logger,
  ParseIntPipe,
  UseGuards,
  ValidationPipe,
  HttpCode, // <-- Import HttpCode
  // Req,
} from '@nestjs/common';
import { PembayaranTiketService } from './pembayaran-tiket.service';
import { PembayaranTiket } from './pembayaran-tiket.entity';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiParam,
  ApiBody,
  ApiNoContentResponse, // <-- Import ApiNoContentResponse
} from '@nestjs/swagger';
// import { Request } from 'express';
import { CreatePembayaranTiketDto } from './create-pembayaran-tiket.dto';
// Disarankan: Buat DTO untuk Update
// import { UpdatePembayaranTiketDto } from './dto/update-pembayaran-tiket.dto';

@ApiTags('Pembayaran Tiket')
@ApiBearerAuth()
@Controller('pembayaran-tiket')
export class PembayaranTiketController {
  private readonly logger = new Logger(PembayaranTiketController.name);

  constructor(
    private readonly pembayaranTiketService: PembayaranTiketService,
  ) {}

  // --- POST Endpoint ---
  @Post()
  @ApiOperation({ summary: 'Create a new ticket payment record' })
  @ApiBody({
    type: CreatePembayaranTiketDto,
    description: 'Data for the new ticket payment (userId, tiketId)',
  })
  @ApiCreatedResponse({
    description: 'Ticket payment created successfully.',
    type: PembayaranTiket,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data (validation failed).',
  })
  @ApiNotFoundResponse({
    description: 'User or Tiket not found for the provided IDs.',
  }) // For FK errors
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Invalid or missing token.',
  })
  async createPembayaranTiket(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    createPembayaranTiketDto: CreatePembayaranTiketDto,
  ): Promise<PembayaranTiket> {
    this.logger.log(
      `Attempting to create payment record with data: ${JSON.stringify(createPembayaranTiketDto)}`,
    );
    try {
      const newPembayaran = await this.pembayaranTiketService.create(
        createPembayaranTiketDto,
      );
      return newPembayaran;
    } catch (error) {
      this.logger.error(
        `Error creating payment record: ${error.message}`,
        error.stack,
      );
      // Biarkan NestJS menangani error yang dilempar oleh service (misalnya NotFoundException)
      throw error;
    }
  }

  // --- GET All Endpoint ---
  @Get()
  @ApiOperation({ summary: 'Get all ticket payments' })
  @ApiOkResponse({
    description: 'List of all ticket payments.',
    type: [PembayaranTiket],
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Invalid or missing token.',
  })
  async getAllPembayaranTikets(): Promise<PembayaranTiket[]> {
    this.logger.log('Fetching all payment records');
    const pembayaranTikets = await this.pembayaranTiketService.findAll();
    return pembayaranTikets;
  }

  // --- GET By ID Endpoint ---
  @Get(':id')
  @ApiOperation({ summary: 'Get a ticket payment by its ID' })
  @ApiParam({
    name: 'id',
    description: 'ID of the ticket payment to retrieve',
    type: Number,
  })
  @ApiOkResponse({
    description: 'Ticket payment retrieved successfully.',
    type: PembayaranTiket,
  })
  @ApiNotFoundResponse({ description: 'Ticket payment not found.' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Invalid or missing token.',
  })
  async getPembayaranTiketById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PembayaranTiket> {
    this.logger.log(`Fetching payment record with ID: ${id}`);
    const pembayaran = await this.pembayaranTiketService.findById(id);
    if (!pembayaran) {
      this.logger.warn(`Payment record with ID ${id} not found.`);
      throw new NotFoundException(`Payment record with ID ${id} not found.`);
    }
    return pembayaran;
  }
}
