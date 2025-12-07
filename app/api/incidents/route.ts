import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/db';
import { Incident } from '@/lib/db/entity/Incident';

const DEFAULT_LIMIT = 200;
const MAX_LIMIT = 500;

export async function GET(request: NextRequest) {
  try {
    const dataSource = await getDataSource();
    const incidentRepository = dataSource.getRepository(Incident);

    const searchParams = request.nextUrl.searchParams;
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');
    const account = searchParams.get('account');
    const source = searchParams.get('source');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const sortBy = searchParams.get('sortBy') || 'timestamp';
    const sortOrder = searchParams.get('sortOrder') || 'DESC';
    const rawLimit = searchParams.get('limit');
    const rawOffset = searchParams.get('offset');

    const parsedLimit = rawLimit ? parseInt(rawLimit, 10) : DEFAULT_LIMIT;
    const limit = Number.isFinite(parsedLimit)
      ? Math.min(Math.max(parsedLimit, 1), MAX_LIMIT)
      : DEFAULT_LIMIT;

    const parsedOffset = rawOffset ? parseInt(rawOffset, 10) : 0;
    const offset =
      Number.isFinite(parsedOffset) && parsedOffset > 0 ? parsedOffset : 0;

    const queryBuilder = incidentRepository.createQueryBuilder('incident');

    if (severity) {
      queryBuilder.andWhere('incident.severity = :severity', { severity });
    }

    if (status) {
      queryBuilder.andWhere('incident.status = :status', { status });
    }

    if (account) {
      queryBuilder.andWhere('incident.account = :account', { account });
    }

    if (source) {
      queryBuilder.andWhere('incident.source = :source', { source });
    }

    if (search) {
      queryBuilder.andWhere(
        '(incident.title LIKE :search OR incident.account LIKE :search OR incident.source LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (startDate) {
      queryBuilder.andWhere('DATE(incident.timestamp) >= :startDate', {
        startDate,
      });
    }

    if (endDate) {
      queryBuilder.andWhere('DATE(incident.timestamp) <= :endDate', {
        endDate,
      });
    }

    // Validate sortBy to prevent SQL injection
    const allowedSortFields = [
      'timestamp',
      'severity',
      'status',
      'account',
      'source',
      'createdAt',
    ];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'timestamp';
    const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    queryBuilder.orderBy(`incident.${sortField}`, sortDirection);

    queryBuilder.limit(limit);
    queryBuilder.offset(offset);

    const [incidents, total] = await queryBuilder.getManyAndCount();

    // Parse tags JSON strings
    const incidentsWithParsedTags = incidents.map((incident) => ({
      ...incident,
      tags: JSON.parse(incident.tags || '[]'),
    }));

    return NextResponse.json({
      incidents: incidentsWithParsedTags,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incidents' },
      { status: 500 },
    );
  }
}
