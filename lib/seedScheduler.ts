const SEED_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const DEFAULT_BASE_URL =
  process.env.SEED_BASE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'http://localhost:3000';

declare global {
  var __incidentSeedInterval: NodeJS.Timeout | undefined;
}

const getSeedUrl = () =>
  `${DEFAULT_BASE_URL.replace(/\/$/, '')}/api/incidents/seed`;

const postSeed = async () => {
  const seedUrl = getSeedUrl();
  await fetch(seedUrl, { method: 'POST', cache: 'no-store' });
};

export const startIncidentSeedScheduler = () => {
  if (typeof window !== 'undefined') return; // server-only
  if (global.__incidentSeedInterval) return; // already running

  const runSeed = async () => {
    try {
      console.log('[seedScheduler] seeding incidents...');
      await postSeed();
      console.log('[seedScheduler] seed request sent');
    } catch (error) {
      console.error('[seedScheduler] failed to seed incidents', error);
    }
  };

  console.log('[seedScheduler] starting scheduler');
  runSeed();
  global.__incidentSeedInterval = setInterval(runSeed, SEED_INTERVAL_MS);
};

export const stopIncidentSeedScheduler = () => {
  if (global.__incidentSeedInterval) {
    clearInterval(global.__incidentSeedInterval);
    global.__incidentSeedInterval = undefined;
  }
};

startIncidentSeedScheduler();
