import { Injectable, Logger, NotFoundException } from '@nestjs/common'; // Tambahkan NotFoundException
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tiket } from './tiket.entity'; // Pastikan path sesuai
// Import CreateTiketDto if you create one for validation and structure
// import { CreateTiketDto } from './dto/create-tiket.dto';
// Import UpdateTiketDto if you create one for validation and structure for updates
// import { UpdateTiketDto } from './dto/update-tiket.dto';

@Injectable()
export class TiketService {
  private readonly logger = new Logger(TiketService.name);

  constructor(
    @InjectRepository(Tiket)
    private tiketRepository: Repository<Tiket>,
  ) {}

  /**
   * Creates a new ticket record in the database.
   * @param tiketData - The data for the new ticket. Using Partial<Tiket> for flexibility,
   *                    but a dedicated CreateTiketDto is recommended for validation.
   * @returns The newly created Tiket entity.
   */
  async create(tiketData: Partial<Tiket>): Promise<Tiket> {
    // Jika menggunakan DTO: async create(createTiketDto: CreateTiketDto): Promise<Tiket> {
    this.logger.log(
      `Attempting to create a new ticket with data: ${JSON.stringify(
        tiketData,
      )}`,
    );
    // Buat instance entitas baru dari data yang disediakan
    const newTiket = this.tiketRepository.create(tiketData);
    // Simpan instance entitas baru ke database
    const savedTiket = await this.tiketRepository.save(newTiket);
    this.logger.log(`Successfully created ticket with ID: ${savedTiket.id}`);
    return savedTiket;
  }

  /**
   * Finds a ticket by its ID.
   * @param id - The ticket ID.
   * @returns The found Tiket entity or null if not found.
   *          Consider throwing NotFoundException here if null is not desired.
   */
  async findById(id: number): Promise<Tiket | null> {
    this.logger.log(`Attempting to find ticket by ID: ${id}`);
    const tiket = await this.tiketRepository.findOne({ where: { id } });
    if (!tiket) {
      this.logger.warn(`Ticket with ID ${id} not found.`);
      // Opsional: Anda bisa melempar exception di sini jika tiket *harus* ada
      // throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
    return tiket;
  }

  /**
   * Finds tickets by their location.
   * @param lokasi - The location to search for.
   * @returns An array of matching Tiket entities.
   */
  async findByLokasi(lokasi: string): Promise<Tiket[]> {
    this.logger.log(`Attempting to find tickets by location: ${lokasi}`);
    const tikets = await this.tiketRepository.find({
      where: { lokasi },
    });
    if (tikets.length === 0) {
      this.logger.warn(`No tickets found for location: ${lokasi}`);
    }
    return tikets;
  }

  /**
   * Saves (updates or creates) a ticket to the database.
   * Note: This method is generic. If you only need update functionality,
   * consider creating a separate `update` method (which is now added below).
   * @param tiket - The Tiket entity to save (should have an ID for updates).
   * @returns The saved Tiket entity.
   */
  async save(tiket: Tiket): Promise<Tiket> {
    this.logger.log(
      `Saving ticket (ID: ${tiket.id ?? 'new'}, Name: ${tiket.nama})`,
    );
    return await this.tiketRepository.save(tiket);
  }

  /**
   * Finds all tickets.
   * @returns Array of all Tiket entities.
   */
  async findAll(): Promise<Tiket[]> {
    this.logger.log('Fetching all tickets');
    return await this.tiketRepository.find();
  }

  // --- Metode Update dan Delete ---

  /**
   * Updates an existing ticket.
   * @param id The ID of the ticket to update.
   * @param updateData Partial data to update the ticket with.
   *                   Consider using a dedicated UpdateTiketDto for validation.
   * @returns The updated Tiket entity.
   * @throws NotFoundException if the ticket with the given ID doesn't exist.
   */
  async update(id: number, updateData: Partial<Tiket>): Promise<Tiket> {
    // Jika menggunakan DTO: async update(id: number, updateTiketDto: UpdateTiketDto): Promise<Tiket> {
    this.logger.log(`Attempting to update ticket with ID: ${id}`);
    // 1. Cari tiket yang ada terlebih dahulu
    const tiket = await this.findById(id); // Memanfaatkan findById yang sudah ada
    // const tiket = await this.tiketRepository.preload({
    //   id: id,
    //   ...updateData,
    // }); // Alternatif menggunakan preload

    if (!tiket) {
      this.logger.warn(`Ticket with ID ${id} not found for update.`);
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    // 2. Gabungkan data yang ada dengan data pembaruan
    // Metode merge lebih aman daripada menimpa langsung
    this.tiketRepository.merge(tiket, updateData);
    // Alternatif jika tidak menggunakan merge: Object.assign(tiket, updateData);

    // 3. Simpan perubahan ke database
    const updatedTiket = await this.tiketRepository.save(tiket);
    this.logger.log(`Successfully updated ticket with ID: ${id}`);
    return updatedTiket;
  }

  /**
   * Removes a ticket from the database.
   * @param id The ID of the ticket to remove.
   * @returns Promise<void> indicating completion.
   * @throws NotFoundException if the ticket with the given ID doesn't exist.
   */
  async remove(id: number): Promise<void> {
    this.logger.log(`Attempting to remove ticket with ID: ${id}`);
    // Opsi 1: Menggunakan metode delete dari repository
    const result = await this.tiketRepository.delete(id);

    // Periksa apakah ada baris yang terpengaruh (dihapus)
    if (result.affected === 0) {
      this.logger.warn(`Ticket with ID ${id} not found for removal.`);
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    // Opsi 2: Cari dulu, baru hapus (lebih banyak query tapi bisa melakukan validasi tambahan jika perlu)
    /*
    const tiket = await this.findById(id);
    if (!tiket) {
      this.logger.warn(`Ticket with ID ${id} not found for removal.`);
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
    await this.tiketRepository.remove(tiket);
    */

    this.logger.log(`Successfully removed ticket with ID: ${id}`);
    // Tidak perlu return apa pun karena return type adalah void
  }
}