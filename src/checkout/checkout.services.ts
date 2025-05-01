// src/checkout/checkout.service.ts

import {
    Injectable,
    Logger,
    NotFoundException,
    ConflictException,
    BadRequestException, // <-- Import BadRequestException
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository, QueryFailedError } from 'typeorm';
  import { Checkout } from './checkout.entity';
  import { CreateCheckoutDto } from './create-checkout.dto';
  // Import UpdateCheckoutDto jika Anda membuatnya
  // import { UpdateCheckoutDto } from './dto/update-checkout.dto';
  // Import PembayaranTiket entity if needed for existence checks
  // import { PembayaranTiket } from '../pembayaranTiket/pembayaran-tiket.entity';
  
  @Injectable()
  export class CheckoutService {
    private readonly logger = new Logger(CheckoutService.name);
  
    constructor(
      @InjectRepository(Checkout)
      private checkoutRepository: Repository<Checkout>,
      // Optionally inject PembayaranTiket repository for checks
      // @InjectRepository(PembayaranTiket) private pembayaranTiketRepository: Repository<PembayaranTiket>,
    ) {}
  
    /**
     * Creates a new checkout record.
     * Links it to an existing PembayaranTiket record.
     * @param createCheckoutDto - DTO containing pembayaranId and total_harga.
     * @returns The newly created Checkout entity.
     * @throws NotFoundException if the associated PembayaranTiket ID does not exist.
     * @throws ConflictException if a Checkout record already exists for the given PembayaranTiket ID.
     */
    async create(createCheckoutDto: CreateCheckoutDto): Promise<Checkout> { // Return Checkout, not Checkout | null
      const { pembayaranId, total_harga } = createCheckoutDto;
      this.logger.log(
        `Attempting to create checkout for Pembayaran ID: ${pembayaranId} with Total Harga: ${total_harga}`,
      );
  
      // Check if a checkout already exists for this payment (due to OneToOne constraint logic)
      const existingCheckout = await this.findByPembayaranId(pembayaranId);
      if (existingCheckout) {
        throw new ConflictException(
          `Checkout record already exists for Pembayaran ID ${pembayaranId}`,
        );
      }
  
      const newCheckout = this.checkoutRepository.create({
        total_harga,
        pembayaran: { id: pembayaranId }, // Link to PembayaranTiket via its ID
        // 'tanggal' will use the database default CURRENT_TIMESTAMP
      });
  
      try {
        const savedCheckout = await this.checkoutRepository.save(newCheckout);
        this.logger.log(
          `Successfully created checkout record with ID: ${savedCheckout.id} for Pembayaran ID: ${pembayaranId}`,
        );
        // Return the newly saved entity, loading relations as defined in findById
        // 'save' might not return relations, findById ensures they are loaded.
        return this.findById(savedCheckout.id).then(checkout => {
          if (!checkout) {
              // This case should be highly unlikely if save succeeded
              this.logger.error(`Failed to re-fetch checkout with ID ${savedCheckout.id} after creation.`);
              throw new Error('Failed to retrieve checkout after creation.');
          }
          return checkout;
        });
      } catch (error) {
        this.logger.error(
          `Failed to create checkout for Pembayaran ID: ${pembayaranId}. Error: ${error.message}`,
          error.stack,
        );
        if (error instanceof QueryFailedError) {
          if (error.driverError?.code === '23503') { // FK violation
            throw new NotFoundException(
              `Failed to create checkout: PembayaranTiket with ID ${pembayaranId} not found.`,
            );
          }
          if (error.driverError?.code === '23505') { // Unique violation
            // This might be redundant due to the pre-check, but good as a safeguard
            throw new ConflictException(
              `Checkout record already exists for Pembayaran ID ${pembayaranId}`,
            );
          }
        }
        // Re-throw if not handled specifically
        throw error instanceof Error ? error : new Error(`Could not create checkout record: ${error.message}`);
      }
    }
  
    /**
     * Finds a checkout record by its ID.
     * Loads the associated payment record.
     * @param id - The checkout record ID.
     * @returns The found Checkout entity or null if not found.
     */
    async findById(id: number): Promise<Checkout | null> {
      this.logger.log(`Attempting to find checkout record by ID: ${id}`);
      const checkout = await this.checkoutRepository.findOne({
        where: { id },
        relations: ['pembayaran'], // Memuat relasi pembayaran
      });
      if (!checkout) {
        this.logger.warn(`Checkout record with ID ${id} not found.`);
      }
      return checkout;
    }
  
    /**
     * Finds the checkout record associated with a specific PembayaranTiket ID.
     * Loads the associated payment record.
     * @param pembayaranId - The ID of the associated PembayaranTiket.
     * @returns The found Checkout entity or null if not found.
     */
    async findByPembayaranId(pembayaranId: number): Promise<Checkout | null> {
      this.logger.log(
        `Attempting to find checkout record for pembayaran ID: ${pembayaranId}`,
      );
      const checkout = await this.checkoutRepository.findOne({
        where: { pembayaran: { id: pembayaranId } }, // Query by related ID
        relations: ['pembayaran'],
      });
      // Tidak perlu warning jika tidak ditemukan, karena ini bisa jadi pengecekan sebelum create
      return checkout;
    }
  
     /**
     * Finds all checkout records.
     * Loads the associated payment records.
     * @returns Array of all Checkout entities.
     */
    async findAll(): Promise<Checkout[]> {
      this.logger.log('Fetching all checkout records');
      return await this.checkoutRepository.find({ relations: ['pembayaran'] });
    }
  
    // --- Metode Update ---
    /**
     * Updates an existing checkout record, typically only the 'total_harga'.
     * The associated 'pembayaran' should generally not be changed.
     * @param id The ID of the checkout record to update.
     * @param updateData Data to update the checkout with (e.g., { total_harga: new_value }).
     *                   Consider using a dedicated UpdateCheckoutDto.
     * @returns The updated Checkout entity.
     * @throws NotFoundException if the checkout record with the given ID doesn't exist.
     * @throws BadRequestException if an attempt is made to change the associated Pembayaran.
     */
    async update(id: number, updateData: Partial<Checkout>): Promise<Checkout> {
      // Jika menggunakan DTO: async update(id: number, updateDto: UpdateCheckoutDto): Promise<Checkout> {
      this.logger.log(`Attempting to update checkout record with ID: ${id}`);
  
      // 1. Cari checkout yang ada
      // Menggunakan preload lebih efisien untuk update, karena memuat entity dan mempersiapkannya untuk save
      // Preload akan return undefined jika ID tidak ditemukan
      const checkoutToUpdate = await this.checkoutRepository.preload({
          id: id,
          // Jangan sertakan pembayaran di sini untuk mencegah perubahan yang tidak diinginkan
          // Hanya sertakan field yang boleh diupdate dari updateData
          total_harga: updateData.total_harga, // Contoh: hanya izinkan update total_harga
      });
  
      // Alternatif: Fetch dulu baru merge
      // const checkoutToUpdate = await this.findById(id);
  
      if (!checkoutToUpdate) {
        this.logger.warn(`Checkout record with ID ${id} not found for update.`);
        throw new NotFoundException(`Checkout record with ID ${id} not found`);
      }
  
      // 2. Validasi Penting: Cegah perubahan relasi Pembayaran
      if (updateData.pembayaran || (updateData as any).pembayaranId) {
          this.logger.warn(`Attempt to change Pembayaran association for Checkout ID ${id} was blocked.`);
          throw new BadRequestException('Cannot change the associated Pembayaran for an existing Checkout.');
      }
  
      // Jika menggunakan findById + merge:
      // this.checkoutRepository.merge(checkoutToUpdate, { total_harga: updateData.total_harga });
  
      try {
          // 3. Simpan perubahan
          const updatedCheckout = await this.checkoutRepository.save(checkoutToUpdate);
          this.logger.log(`Successfully updated checkout record with ID: ${id}`);
          // Return updated entity, findById ensures relations are loaded if needed after save
          // return this.findById(updatedCheckout.id); // Atau kembalikan hasil save jika relasi tidak krusial
          return updatedCheckout; // Save dengan preload biasanya mengembalikan entity yang diupdate
      } catch (error) {
           this.logger.error(`Failed to update checkout record ID ${id}. Error: ${error.message}`, error.stack);
           // Handle potential errors during save if any specific constraints might be violated
           throw new Error(`Could not update checkout record: ${error.message}`);
      }
    }
  
  
    // --- Metode Delete ---
    /**
     * Deletes a checkout record by its ID.
     * @param id - The ID of the checkout record to delete.
     * @returns Promise<void>
     * @throws NotFoundException if the record doesn't exist.
     */
    async remove(id: number): Promise<void> {
      this.logger.log(`Attempting to remove checkout record with ID: ${id}`);
      // Menggunakan metode delete dari repository
      const result = await this.checkoutRepository.delete(id);
  
      // Periksa apakah ada baris yang terpengaruh (dihapus)
      if (result.affected === 0) {
        this.logger.warn(`Checkout record with ID ${id} not found for removal.`);
        throw new NotFoundException(`Checkout record with ID ${id} not found`);
      }
  
      // Alternatif: Cari dulu, baru hapus (lebih banyak query, tapi bisa validasi tambahan)
      /*
      const checkoutToRemove = await this.findById(id);
      if (!checkoutToRemove) {
         this.logger.warn(`Checkout record with ID ${id} not found for removal.`);
         throw new NotFoundException(`Checkout record with ID ${id} not found`);
      }
      await this.checkoutRepository.remove(checkoutToRemove);
      */
  
      this.logger.log(`Successfully removed checkout record with ID: ${id}`);
      // Tidak perlu return apa pun karena return type adalah void
    }
  
    /**
     * Saves (creates or updates) a checkout record.
     * Prefer using specific create() or update() methods.
     * @deprecated Use create() or update() instead for better clarity and control.
     * @param checkoutData - Data to save.
     * @returns The saved Checkout entity.
     */
    async save(checkoutData: Partial<Checkout> & { id?: number; pembayaran?: { id: number }; }): Promise<Checkout> {
        this.logger.warn('Generic save() method called. Consider using create() or update() for clarity and specific validation.');
        const checkoutId = checkoutData.id ?? 'new';
        const pembayaranId = checkoutData.pembayaran?.id ?? 'unknown';
        this.logger.log(`Saving checkout record (ID: ${checkoutId}, Pembayaran ID: ${pembayaranId})`);
        // TypeORM's save handles both based on ID presence. Be cautious with relations.
        const checkout = this.checkoutRepository.create(checkoutData); // Ensure it's a proper entity instance
        return await this.checkoutRepository.save(checkout);
    }
  }