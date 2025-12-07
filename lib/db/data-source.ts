import { DataSource } from 'typeorm';
import { Incident } from './entity/Incident';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'dev.db',
  synchronize: true, // Auto-create tables (set to false in production)
  logging: process.env.NODE_ENV === 'development',
  entities: [Incident],
  migrations: ['lib/db/migration/**/*.ts'],
  subscribers: ['lib/db/subscriber/**/*.ts'],
});

// Initialize the data source
let dataSourceInitialized = false;

export async function initializeDataSource() {
  if (!dataSourceInitialized) {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    dataSourceInitialized = true;
  }
  return AppDataSource;
}
