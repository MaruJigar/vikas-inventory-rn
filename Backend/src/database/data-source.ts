import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables directly so the CLI doesn't need NestJS Context
config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'vikas_inventory',
  entities: [join(__dirname, '..', '**', '*.entity{.ts,.js}')],
  migrations: [join(__dirname, '..', 'migrations', '*{.ts,.js}')],
  // NEVER synchronize in production or via CLI scripts!
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
};

// Export the instantiated DataSource for the TypeORM CLI
export const AppDataSource = new DataSource(dataSourceOptions);
