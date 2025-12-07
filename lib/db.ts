import { AppDataSource, initializeDataSource } from './db/data-source';

// Ensure database is initialized
let initPromise: Promise<void> | null = null;

export async function getDataSource() {
  if (!initPromise) {
    initPromise = initializeDataSource().then(() => {});
  }
  await initPromise;
  return AppDataSource;
}
