import { getDataSource } from './db';
import { Incident } from '@/lib/db/entity/Incident';

const severities = ['Critical', 'High', 'Med', 'Low'] as const;
const sources = ['EDR', 'Email', 'Identity', 'Network', 'Cloud', 'Endpoint'] as const;
const statuses = ['Open', 'Investigating', 'Resolved'] as const;

const sampleTitles = [
  'Unauthorized access attempt detected',
  'Suspicious file download',
  'Multiple failed login attempts',
  'Unusual network traffic pattern',
  'Malware signature detected',
  'Privilege escalation attempt',
  'Data exfiltration attempt',
  'Phishing email reported',
  'Account compromise suspected',
  'Ransomware activity detected',
  'Command and control communication',
  'Insider threat indicators',
  'API abuse detected',
  'Credential stuffing attack',
  'Zero-day exploit attempt',
];

const sampleAccounts = [
  'acme-corp',
  'tech-startup-inc',
  'global-enterprise',
  'finance-company',
  'healthcare-provider',
  'retail-chain',
  'manufacturing-ltd',
  'consulting-group',
];

const sampleTags = [
  'urgent',
  'malware',
  'phishing',
  'insider',
  'external',
  'automated',
  'manual-review',
  'false-positive',
  'critical-asset',
  'compliance',
];

function getRandomElement<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements<T>(array: readonly T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

export async function generateIncident() {
  const dataSource = await getDataSource();
  const incidentRepository = dataSource.getRepository(Incident);

  const severity = getRandomElement(severities);
  const source = getRandomElement(sources);
  const status = getRandomElement(statuses);
  const account = getRandomElement(sampleAccounts);
  const title = getRandomElement(sampleTitles);
  const tagCount = Math.floor(Math.random() * 3) + 1; // 1-3 tags
  const tags = getRandomElements(sampleTags, tagCount);

  const incident = new Incident();
  incident.severity = severity;
  incident.title = title;
  incident.account = account;
  incident.source = source;
  incident.status = status;
  incident.tags = JSON.stringify(tags);
  incident.timestamp = new Date();

  const savedIncident = await incidentRepository.save(incident);

  return {
    ...savedIncident,
    tags: JSON.parse(savedIncident.tags || '[]'),
  };
}

let intervalId: NodeJS.Timeout | null = null;

export function startIncidentGenerator() {
  if (intervalId) {
    return; // Already running
  }

  console.log('Starting incident generator (every 30 seconds)...');

  // Generate first incident immediately
  generateIncident().catch((error) => {
    console.error('Error generating initial incident:', error);
  });

  // Then generate every 30 seconds
  intervalId = setInterval(() => {
    generateIncident().catch((error) => {
      console.error('Error generating incident:', error);
    });
  }, 30000);
}

export function stopIncidentGenerator() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('Stopped incident generator');
  }
}
