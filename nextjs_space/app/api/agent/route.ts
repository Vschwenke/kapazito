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

  general: `Du bist der Kapazito-Assistent, ein intelligenter Business-Intelligence-Berater f\u00fcr Professional-Services-Unternehmen. Du kannst bei allen Fragen zu Finanzen, HR, Sales, Auslastung und operativem Gesch\u00e4ft helfen. Antworte freundlich, pr\u00e4zise und auf Deutsch.`,
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

    // Fetch comprehensive real KPI data for all agents
    let contextData = '';
    try {
      const year = 2026;
      const [
        employees, accounts, cashflow, personnelCosts,
        timeEntries, invoices, openItems, absences, allCustomers, allProjects,
      ] = await Promise.all([
        prisma.employee.findMany({ where: { isActive: true }, include: { userReports: { where: { year } }, assignments: { where: { endDate: null }, include: { customer: true } } } }),
        prisma.financialAccount.findMany({ where: { year } }),
        prisma.cashflowEntry.findMany({ where: { year }, orderBy: { month: 'asc' } }),
        prisma.personnelCost.findMany({ where: { year } }),
        prisma.timeEntry.findMany({ where: { date: { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) } }, include: { customer: true, employee: true } }),
        prisma.invoice.findMany({ where: { issueDate: { gte: new Date(year, 0, 1) } } }),
        prisma.openItem.findMany({ where: { year } }),
        prisma.absence.findMany({ where: { startDate: { gte: new Date(year, 0, 1) } } }),
        prisma.customer.findMany({ where: { isActive: true }, include: { projects: true } }),
        prisma.project.findMany({ where: { isActive: true }, include: { customer: { select: { name: true } } } }),
      ]);

      const revenue = accounts.filter(a => a.accountNumber === '1020').reduce((s, a) => s + (a.amount ?? 0), 0);
      const betriebsergebnis = accounts.filter(a => a.accountNumber === '1270').reduce((s, a) => s + (a.amount ?? 0), 0);
      const gesamtkosten = accounts.filter(a => a.accountNumber === '1260').reduce((s, a) => s + (a.amount ?? 0), 0);
      const totalPersonnel = personnelCosts.reduce((s, p) => s + (p.totalCost ?? 0), 0);
      const totalBillableH = timeEntries.reduce((s, t) => s + (t.billableHours ?? 0), 0);
      const totalH = timeEntries.reduce((s, t) => s + (t.hours ?? 0), 0);
      const billableRatio = totalH > 0 ? (totalBillableH / totalH * 100).toFixed(1) : '0';
      const avgRate = totalBillableH > 0 ? (revenue / totalBillableH).toFixed(0) : '0';
      const personnelQuote = revenue > 0 ? (totalPersonnel / revenue * 100).toFixed(1) : '0';
      const latestCF = cashflow.length > 0 ? cashflow[cashflow.length - 1] : null;
      const sickDays = absences.filter(a => a.type === 'Krank').reduce((s, a) => s + (a.days ?? 0), 0);
      const totalInvoiced = invoices.reduce((s, i) => s + (i.totalAmount ?? 0), 0);
      const totalPaid = invoices.reduce((s, i) => s + (i.paidAmount ?? 0), 0);
      const bench = employees.filter(e => !e.assignments || e.assignments.length === 0);
      const avgUtil = employees.length > 0 ? (employees.reduce((s, e) => {
        const reps = e.userReports ?? [];
        const tgt = reps.reduce((ss: number, r: any) => ss + (r.targetHours ?? 0), 0);
        const bill = reps.reduce((ss: number, r: any) => ss + (r.billableHours ?? 0), 0);
        return s + (tgt > 0 ? bill / tgt : 0);
      }, 0) / employees.length * 100).toFixed(1) : '0';

      const revByCust: Record<string, number> = {};
      for (const te of timeEntries) {
        const cn = te.customer?.name ?? 'Intern';
        revByCust[cn] = (revByCust[cn] ?? 0) + (te.billableHours ?? 0) * parseFloat(avgRate);
      }
      const topCusts = Object.entries(revByCust).sort((a, b) => b[1] - a[1]).slice(0, 5);

      contextData = `\n\n=== ECHTE GESCH\u00c4FTSDATEN ${year} ===\nFINANZEN:\n- Gesamtumsatz: ${revenue.toLocaleString('de-DE')}\u20ac\n- Betriebsergebnis: ${betriebsergebnis.toLocaleString('de-DE')}\u20ac\n- Gesamtkosten: ${gesamtkosten.toLocaleString('de-DE')}\u20ac\n- Personalkosten: ${totalPersonnel.toLocaleString('de-DE')}\u20ac (Quote: ${personnelQuote}%)\n- Revenue/MA: ${employees.length > 0 ? (revenue / employees.length).toLocaleString('de-DE') : 0}\u20ac\n- Liquidit\u00e4t: ${latestCF?.cumulative?.toLocaleString('de-DE') ?? 'N/A'}\u20ac\n\nHR & TEAM:\n- ${employees.length} aktive MA, \u00d8 Auslastung: ${avgUtil}%, Billable Ratio: ${billableRatio}%\n- Abrechenbare Std: ${totalBillableH.toLocaleString('de-DE')}, Gesamt: ${totalH.toLocaleString('de-DE')}\n- Bench: ${bench.length} MA (${bench.map(e => `${e.firstName} ${e.lastName}`).join(', ') || 'keine'})\n- Krankheitstage: ${sickDays} (\u00d8 ${employees.length > 0 ? (sickDays / employees.length).toFixed(1) : 0}/MA)\n- Team: ${employees.map(e => `${e.firstName} ${e.lastName} (${e.experienceLevel || '-'}, ${e.monthlyIncome ? e.monthlyIncome.toLocaleString('de-DE') + '\u20ac' : '-'})`).join('; ')}\n\nSALES:\n- ${allCustomers.length} Kunden: ${allCustomers.map(c => c.name).join(', ')}\n- ${allProjects.length} Projekte, \u00d8 Stundensatz: ${avgRate}\u20ac\n- Top 5: ${topCusts.map(([n, v]) => `${n}: ${v.toLocaleString('de-DE')}\u20ac`).join(', ')}\n\nRECHNUNGEN:\n- Fakturiert: ${totalInvoiced.toLocaleString('de-DE')}\u20ac, Bezahlt: ${totalPaid.toLocaleString('de-DE')}\u20ac, Offen: ${(totalInvoiced - totalPaid).toLocaleString('de-DE')}\u20ac\n- \u00dcberf\u00e4llig: ${invoices.filter(i => i.status === 'overdue').length}\n\nNutze diese echten Zahlen f\u00fcr Analysen und konkrete Handlungsempfehlungen.`;
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