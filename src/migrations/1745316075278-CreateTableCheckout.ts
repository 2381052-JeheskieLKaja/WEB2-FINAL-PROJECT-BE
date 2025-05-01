// src/migration/1700000000004-CreateCheckoutTable.ts
import { MigrationInterface, QueryRunner } from "typeorm";

// Timestamp example: 1700000000004 (Replace with actual timestamp)
export class CreateCheckoutTable1700000000004 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE checkout (
                id SERIAL PRIMARY KEY,
                bayar_id INT NOT NULL, -- Assuming one checkout per payment record based on diagram? Added UNIQUE. Remove if one payment can lead to multiple checkouts.
                tanggal TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Default to now
                total_harga DECIMAL(12, 2) NOT NULL, -- Using DECIMAL for currency
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                CONSTRAINT fk_checkout_pembayaran
                    FOREIGN KEY (bayar_id)
                    REFERENCES pembayaran_tiket(id)
                    ON DELETE CASCADE -- Or SET NULL / RESTRICT
            );
        `);
         // Add index for foreign key
        await queryRunner.query(`CREATE INDEX idx_checkout_bayar_id ON checkout(bayar_id);`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS checkout;`);
    }

}