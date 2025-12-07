import { NextRequest } from 'next/server';
import { getDataSource } from '@/lib/db';
import { Incident } from '@/lib/db/entity/Incident';
import { MoreThan } from 'typeorm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  // Set up SSE headers
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const sendEvent = (data: Record<string, unknown>) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // Send initial connection message
      sendEvent({ type: 'connected', message: 'Stream connected' });

      // On connect, send a recent batch so the client does not miss new seeds
      try {
        const dataSource = await getDataSource();
        const repo = dataSource.getRepository(Incident);
        const recent = await repo.find({
          order: { createdAt: 'DESC' },
          take: 50,
        });
        if (recent.length > 0) {
          sendEvent({
            type: 'new_incidents',
            incidents: recent.map((incident: Incident) => ({
              ...incident,
              tags: JSON.parse(incident.tags || '[]'),
            })),
          });
        }
      } catch (error) {
        console.error('Error sending initial incidents:', error);
      }

      // Poll for new incidents every 2 seconds
      // Start slightly in the past to avoid missing incidents created between connection and first poll
      let lastCheckTime = new Date(Date.now() - 5000);

      const interval = setInterval(async () => {
        try {
          const dataSource = await getDataSource();
          const incidentRepository = dataSource.getRepository(Incident);

          const newIncidents = await incidentRepository.find({
            where: {
              createdAt: MoreThan(lastCheckTime),
            },
            order: {
              createdAt: 'DESC',
            },
          });

          if (newIncidents.length > 0) {
            const incidentsWithParsedTags = newIncidents.map(
              (incident: Incident) => ({
                ...incident,
                tags: JSON.parse(incident.tags || '[]'),
              }),
            );

            sendEvent({
              type: 'new_incidents',
              incidents: incidentsWithParsedTags,
            });
          }

          // Always advance the checkpoint to the end of this poll window
          lastCheckTime = new Date();
        } catch (error) {
          console.error('Error in SSE stream:', error);
          sendEvent({ type: 'error', message: 'Stream error occurred' });
        }
      }, 2000);

      // Cleanup on client disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, { headers });
}
