import { NextResponse } from 'next/server';
import { generateIncident } from '@/lib/incident-generator';

export async function POST() {
  try {
    const count = 100; // Lighter seed to keep startup fast
    for (let i = 0; i < count; i++) {
      await generateIncident();
    }

    return NextResponse.json({
      message: `Generated ${count} incidents`,
      count,
    });
  } catch (error) {
    console.error('Error seeding incidents:', error);
    return NextResponse.json(
      { error: 'Failed to seed incidents' },
      { status: 500 },
    );
  }
}
