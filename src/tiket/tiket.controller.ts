import {
  Controller,
  Get,
  Post, // Import Post
  Put, // <-- Import Put
  Delete, // <-- Import Delete
  Body, // Import Body
  Param, // Import Param
  NotFoundException,
  Logger,
  ParseIntPipe, // Import ParseIntPipe for ID validation
  UseGuards,
  ValidationPipe, // Import ValidationPipe for DTO validation
  HttpCode, // <-- Import HttpCode for DELETE status
  // Req, // Not used here currently
} from '@nestjs/common';
import { TiketService } from './tiket.service';
import { Tiket } from './tiket.entity';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse, // Import ApiCreatedResponse for POST success
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse, // Import for validation errors
  ApiParam,
  ApiBody, // Import ApiBody to describe the request body
  ApiNoContentResponse, // <-- Import for DELETE success
} from '@nestjs/swagger';
// import { Request } from 'express'; // Not currently needed
// Disarankan: Buat DTO untuk create dan update
// import { CreateTiketDto } from './dto/create-tiket.dto';
// import { UpdateTiketDto } from './dto/update-tiket.dto';

@ApiTags('Tiket')
@ApiBearerAuth() // Menandakan bahwa endpoint di bawah ini memerlukan Bearer Token
@Controller('tiket')
export class TiketController {
  private readonly logger = new Logger(TiketController.name);

  constructor(private readonly tiketService: TiketService) {}

  // --- POST Endpoint ---
  @Post()
  @ApiOperation({ summary: 'Create a new ticket' })
  @ApiBody({
    description: 'Data for creating a new ticket. ID should not be provided.',
    // Jika menggunakan DTO: type: CreateTiketDto
    // Jika tidak:
    schema: {
      type: 'object',
      properties: {
        nama: { type: 'string', example: 'Konser Jazz Merdeka' },
        lokasi: { type: 'string', example: 'Lapangan Banteng' },
        tanggal: {
          type: 'string',
          format: 'date-time',
          example: '2024-08-17T19:00:00Z',
        },
        harga: { type: 'number', example: 150000 },
        stok: { type: 'integer', example: 500 },
        // tambahkan properti lain sesuai Tiket entity
      },
      required: ['nama', 'lokasi', 'tanggal', 'harga', 'stok'], // Sesuaikan
    },
  })
  @ApiCreatedResponse({
    description: 'Ticket created successfully.',
    type: Tiket,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data (validation failed).',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Invalid or missing token.',
  })
  async createTiket(
    // Jika menggunakan DTO, gunakan @Body(ValidationPipe) createTiketDto: CreateTiketDto
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) // <-- Tambahkan ValidationPipe jika ingin validasi dasar
    tiketData: Partial<Tiket>, // <-- Gunakan Partial<Tiket> jika tidak pakai DTO spesifik
  ): Promise<Tiket> {
    this.logger.log(
      `Attempting to create ticket with data: ${JSON.stringify(tiketData)}`,
    );
    // Pastikan ID tidak dikirim oleh klien saat membuat baru
    if (tiketData.id) {
      this.logger.warn(
        'Client attempted to provide an ID during ticket creation.',
      );
      // Anda bisa melempar BadRequestException di sini jika perlu
      delete tiketData.id; // Hapus ID jika ada
    }
    const createdTiket = await this.tiketService.create(tiketData);
    return createdTiket;
  }

  // --- GET All Endpoint ---
  @Get()
  @ApiOperation({ summary: 'Get all tickets' })
  @ApiOkResponse({ description: 'List of all tickets.', type: [Tiket] })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Invalid or missing token.',
  })
  async getAllTikets(): Promise<Tiket[]> {
    this.logger.log('Fetching all tickets');
    const tikets = await this.tiketService.findAll();
    return tikets;
  }

  // --- GET By ID Endpoint ---
  @Get(':id')
  @ApiOperation({ summary: 'Get a ticket by its ID' })
  @ApiParam({
    name: 'id',
    description: 'ID of the ticket to retrieve',
    type: Number,
  })
  @ApiOkResponse({ description: 'Ticket retrieved successfully.', type: Tiket })
  @ApiNotFoundResponse({ description: 'Ticket not found.' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Invalid or missing token.',
  })
  async getTiketById(
    @Param('id', ParseIntPipe) id: number, // Gunakan ParseIntPipe untuk validasi dan konversi
  ): Promise<Tiket> {
    this.logger.log(`Fetching ticket with ID: ${id}`);
    const tiket = await this.tiketService.findById(id);
    if (!tiket) {
      // Service mungkin sudah melempar exception, tapi ini double check
      this.logger.warn(`Ticket with ID ${id} not found in controller.`);
      throw new NotFoundException(`Ticket with ID ${id} not found.`);
    }
    return tiket;
  }

  // --- PUT Endpoint (Update) ---
  @Put(':id')
  @ApiOperation({ summary: 'Update an existing ticket by ID' })
  @ApiParam({
    name: 'id',
    description: 'ID of the ticket to update',
    type: Number,
  })
  @ApiBody({
    description:
      'Data to update the ticket with. Only provided fields will be updated.',
    // Jika menggunakan DTO: type: UpdateTiketDto
    // Jika tidak:
    schema: {
      type: 'object',
      properties: {
        nama: { type: 'string', example: 'Konser Jazz Kemerdekaan Update' },
        lokasi: { type: 'string', example: 'GBK Senayan' },
        tanggal: {
          type: 'string',
          format: 'date-time',
          example: '2024-08-18T20:00:00Z',
        },
        harga: { type: 'number', example: 175000 },
        stok: { type: 'integer', example: 450 },
        // tambahkan properti lain yang boleh diupdate
      },
      // Tidak ada required, karena update bersifat parsial
    },
  })
  @ApiOkResponse({ description: 'Ticket updated successfully.', type: Tiket })
  @ApiNotFoundResponse({ description: 'Ticket not found.' })
  @ApiBadRequestResponse({
    description: 'Invalid input data (validation failed).',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Invalid or missing token.',
  })
  async updateTiket(
    @Param('id', ParseIntPipe) id: number,
    // Jika menggunakan DTO: @Body(ValidationPipe) updateTiketDto: UpdateTiketDto
    @Body(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        skipMissingProperties: true,
      }),
    ) // SkipMissingProperties penting untuk update parsial
    updateData: Partial<Tiket>, // Gunakan Partial<Tiket> atau UpdateTiketDto
  ): Promise<Tiket> {
    this.logger.log(`Attempting to update ticket with ID: ${id}`);
    // Pastikan ID tidak diubah melalui body
    if (updateData.id && updateData.id !== id) {
      this.logger.warn(
        `Client attempted to change ticket ID via body for ID: ${id}. Ignoring body ID.`,
      );
      delete updateData.id;
    }
    const updatedTiket = await this.tiketService.update(id, updateData);
    // Exception NotFound akan dilempar oleh service jika tidak ditemukan
    return updatedTiket;
  }

  // --- DELETE Endpoint ---
  @Delete(':id')
  @HttpCode(204) // <-- Set HTTP status ke 204 No Content untuk sukses DELETE
  @ApiOperation({ summary: 'Delete a ticket by ID' })
  @ApiParam({
    name: 'id',
    description: 'ID of the ticket to delete',
    type: Number,
  })
  @ApiNoContentResponse({ description: 'Ticket deleted successfully.' }) // <-- Gunakan 204
  @ApiNotFoundResponse({ description: 'Ticket not found.' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Invalid or missing token.',
  })
  async deleteTiket(@Param('id', ParseIntPipe) id: number): Promise<void> {
    // <-- Return type void
    this.logger.log(`Attempting to delete ticket with ID: ${id}`);
    await this.tiketService.remove(id);
    // Exception NotFound akan dilempar oleh service jika tidak ditemukan
    this.logger.log(`Successfully deleted ticket with ID: ${id}`);
    // Tidak perlu return apa-apa, NestJS akan mengirim status 204 No Content
  }
}
