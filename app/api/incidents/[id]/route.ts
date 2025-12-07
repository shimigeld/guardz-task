import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/db';
import { Incident } from '@/lib/db/entity/Incident';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const dataSource = await getDataSource();
    const incidentRepository = dataSource.getRepository(Incident);

    const incident = await incidentRepository.findOne({ where: { id } });

    if (!incident) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ...incident,
      tags: JSON.parse(incident.tags || '[]'),
    });
  } catch (error) {
    console.error('Error fetching incident:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incident' },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const dataSource = await getDataSource();
    const incidentRepository = dataSource.getRepository(Incident);

    const body = await request.json();
    const { status, owner, tags, severity, title, account, source } = body;

    const incident = await incidentRepository.findOne({ where: { id } });

    if (!incident) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 },
      );
    }

    if (status !== undefined) incident.status = status;
    if (owner !== undefined) incident.owner = owner;
    if (tags !== undefined) incident.tags = JSON.stringify(tags);
    if (severity !== undefined) incident.severity = severity;
    if (title !== undefined) incident.title = title;
    if (account !== undefined) incident.account = account;
    if (source !== undefined) incident.source = source;

    await incidentRepository.save(incident);

    return NextResponse.json({
      ...incident,
      tags: JSON.parse(incident.tags || '[]'),
    });
  } catch (error) {
    console.error('Error updating incident:', error);
    return NextResponse.json(
      { error: 'Failed to update incident' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const dataSource = await getDataSource();
    const incidentRepository = dataSource.getRepository(Incident);

    const incident = await incidentRepository.findOne({ where: { id } });

    if (!incident) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 },
      );
    }

    await incidentRepository.delete(id);

    return NextResponse.json({ id });
  } catch (error) {
    console.error('Error deleting incident:', error);
    return NextResponse.json(
      { error: 'Failed to delete incident' },
      { status: 500 },
    );
  }
}
