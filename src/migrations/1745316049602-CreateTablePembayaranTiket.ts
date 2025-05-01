// src/migration/1700000000003-CreatePembayaranTiketTable.ts
import { MigrationInterface, QueryRunner } from "typeorm";

// Timestamp example: 1700000000003 (Replace with actual timestamp)
export class CreatePembayaranTiketTable1700000000003 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        CREATE TABLE pembayaran_tiket (
            id SERIAL PRIMARY KEY,
            user_id INT NOT NULL,
            tiket_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
            CONSTRAINT fk_pembayaran_user
                FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE,
        
            CONSTRAINT fk_tiket
                FOREIGN KEY (tiket_id)
                REFERENCES tiket(id)
                ON DELETE CASCADE
        );
        `);
        // Add indexes for foreign keys for better performance
        await queryRunner.query(`CREATE INDEX idx_pembayaran_user_id ON pembayaran_tiket(user_id);`);
        await queryRunner.query(`CREATE INDEX idx_pembayaran_tiket_id ON pembayaran_tiket(tiket_id);`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS pembayaran_tiket;`);
        // Note: Indexes are typically dropped automatically when the table is dropped.
        // Explicit DROP INDEX commands are usually not needed in the down method.
    }

}