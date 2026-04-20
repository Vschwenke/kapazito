export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

const SYSTEM_PROMPTS: Record<string, string> = {
  finanz: `Du bist ein erfahrener Finanz-Analyst f\u00fcr IT-Dienstleister. Du hilfst bei:
- BWA-Analyse und Interpretation von Finanzkennzahlen
- Cashflow-Optimierung und Liquidit\u00e4tsplanung
- Deckungsbeitragsanalyse und Rentabilit\u00e4tsbewertung
- Kostenstruktur-Optimierung
- IST-SOLL-Vergleiche und Forecast-Erstellung
Antworte pr\u00e4zise, nutze Zahlen und Benchmarks. Gib konkrete Handlungsempfehlungen. Antworte auf Deutsch.`,

  hr: `Du bist ein HR-Analyst und Berater f\u00fcr IT-Dienstleister. Du hilfst bei:
- Auslastungsoptimierung und Kapazit\u00e4tsplanung
- Fluktuationsanalyse und Mitarbeiterbindung
- Gehaltsstrukturen und Benchmarking
- Krankenquoten und Abwesenheitsmanagement
- Team-Zusammensetzung und Skill-Management
Antworte datenbasiert und gib konkrete Empfehlungen. Antworte auf Deutsch.`,

  sales: `Du bist ein Sales-Analyst und CRM-Berater f\u00fcr IT-Dienstleister. Du hilfst bei:
- Kundenanalyse und Umsatzoptimierung
- Stundensatz-Strategie und Preisgestaltung
- Pipeline-Management und Forecast
- Cross-Selling und Kundenentwicklung
- Vertriebskennzahlen und Benchmarks
Antworte strategisch und gib umsetzbare Empfehlungen. Antworte auf Deutsch.`,

  general: `Du bist ServiceIQ Assistant, ein intelligenter Business-Intelligence-Berater f\u00fcr IT-Dienstleister. Du kannst bei allen Fragen zu Finanzen, HR, Sales und operativem Gesch\u00e4ft helfen. Antworte freundlich, pr\u00e4zise und auf Deutsch.`,
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Nicht authentifiziert' }), { status: 401 });
    }

    const { messages, agent = 'general' } = await request.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Nachrichten erforderlich' }), { status: 400 });
    }

    const systemPrompt = SYSTEM_PROMPTS[agent] || SYSTEM_PROMPTS.general;

    // Fetch context data based on agent type
    let contextData = '';
    try {
      if (agent === 'finanz') {
        const accounts = await prisma.financialAccount.findMany({ where: { year: 2026 }, orderBy: [{ month: 'asc' }] });
        const cashflow = await prisma.cashflowEntry.findMany({ where: { year: 2026 } });
        contextData = `\n\nAktuelle Finanzdaten (2026):\n- ${accounts.length} Buchungseintr\u00e4ge\n- Cashflow-Eintr\u00e4ge: ${cashflow.length} Monate\n- Letzer Cashflow-Stand: ${cashflow[cashflow.length - 1]?.cumulative?.toLocaleString('de-DE') ?? 'N/A'}\u20ac`;
      } else if (agent === 'hr') {
        const empCount = await prisma.employee.count({ where: { isActive: true } });
        const reports = await prisma.userReport.findMany({ where: { year: 2026 } });
        const avgUtil = reports.length > 0 ? (reports.reduce((s, r) => s + r.utilization, 0) / reports.length).toFixed(1) : 'N/A';
        contextData = `\n\nAktuelle HR-Daten:\n- Aktive Mitarbeiter: ${empCount}\n- Durchschn. Auslastung 2026: ${avgUtil}%\n- Datens\u00e4tze: ${reports.length} Monatsberichte`;
      } else if (agent === 'sales') {
        const customers = await prisma.customer.findMany({ where: { isActive: true } });
        const projects = await prisma.project.findMany({ where: { isActive: true } });
        contextData = `\n\nAktuelle Sales-Daten:\n- Aktive Kunden: ${customers.length}\n- Aktive Projekte: ${projects.length}\n- Kundenliste: ${customers.map(c => c.name).join(', ')}`;
      }
    } catch (e) {
      console.error('Context fetch error:', e);
    }

    const apiMessages = [
      { role: 'system', content: systemPrompt + contextData },
      ...messages.slice(-10),
    ];

    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: apiMessages,
        stream: true,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('LLM API error:', errText);
      return new Response(JSON.stringify({ error: 'KI-Anfrage fehlgeschlagen' }), { status: 500 });
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        try {
          while (true) {
            const { done, value } = await reader!.read();
            if (done) break;
            const chunk = decoder.decode(value);
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Agent API error:', error);
    return new Response(JSON.stringify({ error: 'Interner Fehler' }), { status: 500 });
  }
}
