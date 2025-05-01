// src/migration/1700000000002-CreateTiketTable.ts
import { MigrationInterface, QueryRunner } from "typeorm";

// Timestamp example: 1700000000002 (Replace with actual timestamp)
export class CreateTiketTable1700000000002 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE tiket (
                id SERIAL PRIMARY KEY,
                lokasi VARCHAR(255) NOT NULL,
                harga DECIMAL(10, 2) NOT NULL, -- Using DECIMAL for currency
                nama VARCHAR(150) NOT NULL,
                tanggal TIMESTAMP NOT NULL, -- Using TIMESTAMP for date and time
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        // Note: The 'id' was originally listed after 'lokasi' in the diagram,
        // but it's conventional to have the PK first. SQL doesn't enforce column order strictly.
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS tiket;`);
    }

}