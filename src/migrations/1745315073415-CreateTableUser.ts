import { MigrationInterface, QueryRunner } from "typeorm";

// Timestamp example: 1700000000001 (Replace with actual timestamp)
export class CreateUserTable1700000000001 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE users ( -- Renamed from 'user' to plural 'users' (convention)
                id SERIAL PRIMARY KEY,
                nama VARCHAR(100) NOT NULL,
                password_hash VARCHAR(255) NOT NULL, -- Increased length for hashed passwords
                email VARCHAR(100) UNIQUE NOT NULL, -- Added UNIQUE constraint
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS users;`);
    }

}