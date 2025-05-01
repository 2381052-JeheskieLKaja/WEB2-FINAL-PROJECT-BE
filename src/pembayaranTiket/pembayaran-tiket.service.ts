import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PembayaranTiket } from './pembayaran-tiket.entity'; // Pastikan path sesuai
import { CreatePembayaranTiketDto } from './create-pembayaran-tiket.dto'; // Import the DTO
// Import DTO untuk Update jika Anda membuatnya
// import { UpdatePembayaranTiketDto } from './dto/update-pembayaran-tiket.dto';
import { User } from '../user/user.entity';
import { Tiket } from '../tiket/tiket.entity';

@Injectable()
export class PembayaranTiketService {
  private readonly logger = new Logger(PembayaranTiketService.name);
  update: any;
  remove: any;

  constructor(
    @InjectRepository(PembayaranTiket)
    private pembayaranTiketRepository: Repository<PembayaranTiket>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Tiket)
    private tiketRepository: Repository<Tiket>,
  ) {}

  /**
   * Membuat catatan pembayaran baru, menghubungkan User dan Tiket.
   * @param createPembayaranTiketDto - DTO berisi userId dan tiketId.
   * @returns Entitas PembayaranTiket yang baru dibuat.
   * @throws Error jika User atau Tiket terkait tidak dapat dihubungkan (misalnya, karena constraint FK).
   */
  async create(
    createPembayaranTiketDto: CreatePembayaranTiketDto,
  ): Promise<PembayaranTiket> {
    const { userId, tiketId } = createPembayaranTiketDto;
    this.logger.log(
      `Attempting to create payment record for User ID: ${userId} and Tiket ID: ${tiketId}`,
    );

    try {
      // Check if user exists
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Check if ticket exists
      const tiket = await this.tiketRepository.findOne({
        where: { id: tiketId },
      });
      if (!tiket) {
        throw new NotFoundException(`Ticket with ID ${tiketId} not found`);
      }

      // Create new payment record
      const newPembayaran = this.pembayaranTiketRepository.create({
        userId,
        tiketId,
        user,
        tiket,
      });

      const savedPembayaran =
        await this.pembayaranTiketRepository.save(newPembayaran);
      this.logger.log(
        `Successfully created payment record with ID: ${savedPembayaran.id}`,
      );

      // Return the saved payment with relations
      const result = await this.findById(savedPembayaran.id);
      if (!result) {
        throw new Error('Failed to retrieve created payment record');
      }
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to create payment record for User ID: ${userId}, Tiket ID: ${tiketId}. Error: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Menemukan catatan pembayaran berdasarkan ID-nya. Memuat relasi.
   * @param id - ID catatan pembayaran.
   * @returns Entitas PembayaranTiket yang ditemukan atau null jika tidak ditemukan.
   */
  async findById(id: number): Promise<PembayaranTiket | null> {
    this.logger.log(`Attempting to find payment record by ID: ${id}`);
    try {
      const pembayaran = await this.pembayaranTiketRepository.findOne({
        where: { id },
        relations: ['user', 'tiket', 'checkout'],
      });
      if (!pembayaran) {
        this.logger.warn(`Payment record with ID ${id} not found`);
      }
      return pembayaran;
    } catch (error) {
      this.logger.error(
        `Error finding payment record by ID ${id}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Menemukan catatan pembayaran berdasarkan ID User. Memuat relasi.
   * @param userId - ID pengguna yang melakukan pembayaran.
   * @returns Array entitas PembayaranTiket.
   */
  async findByUserId(userId: number): Promise<PembayaranTiket[]> {
    this.logger.log(
      `Attempting to find payment records for user ID: ${userId}`,
    );
    try {
      const payments = await this.pembayaranTiketRepository.find({
        where: { userId },
        relations: ['user', 'tiket', 'checkout'],
      });
      if (payments.length === 0) {
        this.logger.warn(`No payment records found for user ID: ${userId}`);
      }
      return payments;
    } catch (error) {
      this.logger.error(
        `Error finding payment records for user ID ${userId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Menemukan catatan pembayaran berdasarkan ID Tiket. Memuat relasi.
   * @param tiketId - ID tiket.
   * @returns Array entitas PembayaranTiket.
   */
  async findByTiketId(tiketId: number): Promise<PembayaranTiket[]> {
    this.logger.log(
      `Attempting to find payment records for ticket ID: ${tiketId}`,
    );
    try {
      const payments = await this.pembayaranTiketRepository.find({
        where: { tiketId },
        relations: ['user', 'tiket', 'checkout'],
      });
      if (payments.length === 0) {
        this.logger.warn(`No payment records found for ticket ID: ${tiketId}`);
      }
      return payments;
    } catch (error) {
      this.logger.error(
        `Error finding payment records for ticket ID ${tiketId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Menyimpan (membuat atau memperbarui) catatan pembayaran ke database.
   * Catatan: Lebih baik gunakan metode create/update spesifik untuk kejelasan.
   * @param pembayaranTiket - Entitas PembayaranTiket yang akan disimpan.
   * @returns Entitas PembayaranTiket yang disimpan.
   */
  async save(pembayaranTiket: PembayaranTiket): Promise<PembayaranTiket> {
    const userId = pembayaranTiket.user?.id ?? 'unknown';
    const tiketId = pembayaranTiket.tiket?.id ?? 'unknown';
    this.logger.log(
      `Saving payment record (ID: ${pembayaranTiket.id ?? 'new'}) for user ID: ${userId} and ticket ID: ${tiketId}`,
    );
    return await this.pembayaranTiketRepository.save(pembayaranTiket);
  }

  /**
   * Menemukan semua catatan pembayaran. Memuat relasi.
   * @returns Array dari semua entitas PembayaranTiket.
   */
  async findAll(): Promise<PembayaranTiket[]> {
    this.logger.log('Fetching all payment records');
    try {
      return await this.pembayaranTiketRepository.find({
        relations: ['user', 'tiket', 'checkout'],
      });
    } catch (error) {
      this.logger.error(`Error fetching all payment records: ${error.message}`);
      throw error;
    }
  }
}

// --- Metode Update dan Delete ---

/**
 * Memperbarui catatan pembayaran yang ada.
 * Catatan: Biasanya, Anda tidak akan mengubah userId atau tiketId di sini.
 * Update mungkin untuk status, metode pembayaran, dll.
 * @param id ID catatan pembayaran yang akan diperbarui.
 * @param updateData Data parsial untuk memperbarui catatan pembayaran.
 *                   Sangat disarankan menggunakan UpdatePembayaranTiketDto.
 * @returns Entitas PembayaranTiket yang diperbarui.
 * @throws NotFoundExceptio */
