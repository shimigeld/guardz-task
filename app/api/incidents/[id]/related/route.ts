import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/db';
import { Incident } from '@/lib/db/entity/Incident';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const dataSource = await getDataSource();
    const incidentRepository = dataSource.getRepository(Incident);

    const incident = await incidentRepository.findOne({ where: { id } });

    if (!incident) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    }

    // Find related incidents (same account or same source)
    const relatedQuery = incidentRepository
      .createQueryBuilder('incident')
      .where('incident.id != :id', { id })
      .andWhere('(incident.account = :account OR incident.source = :source)', {
        account: incident.account,
        source: incident.source,
      })
      .orderBy('incident.timestamp', 'DESC')
      .limit(10);

    const relatedIncidentsResult = await relatedQuery.getMany();

    const incidentsWithParsedTags = relatedIncidentsResult.map((incident: Incident) => ({
      ...incident,
      tags: JSON.parse(incident.tags || '[]'),
    }));

    return NextResponse.json({
      related: incidentsWithParsedTags,
    });
  } catch (error) {
    console.error('Error fetching related incidents:', error);
    return NextResponse.json({ error: 'Failed to fetch related incidents' }, { status: 500 });
  }
}
