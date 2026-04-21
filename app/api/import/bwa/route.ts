import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Expected CSV format: Kontonummer;Kontoname;Kategorie;Jahr;Monat;Betrag;Vorjahr;Budget
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rows, separator = ';' } = body as { rows: string; separator?: string };

    if (!rows || typeof rows !== 'string') {
      return NextResponse.json({ error: 'Keine Daten übermittelt' }, { status: 400 });
    }

    const lines = rows.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV muss mindestens eine Kopfzeile und eine Datenzeile enthalten' }, { status: 400 });
    }

    // Parse header
    const header = lines[0].split(separator).map(h => h.trim().toLowerCase());
    const colMap: Record<string, number> = {};
    header.forEach((h, i) => { colMap[h] = i; });

    // Map common German headers
    const getCol = (names: string[]) => {
      for (const n of names) {
        if (colMap[n] !== undefined) return colMap[n];
      }
      return -1;
    };

    const iAccNo = getCol(['kontonummer', 'konto_nr', 'accountnumber', 'konto']);
    const iAccName = getCol(['kontoname', 'bezeichnung', 'accountname', 'name', 'konto_name']);
    const iCategory = getCol(['kategorie', 'category', 'bereich']);
    const iYear = getCol(['jahr', 'year']);
    const iMonth = getCol(['monat', 'month']);
    const iAmount = getCol(['betrag', 'amount', 'wert', 'ist']);
    const iPrevYear = getCol(['vorjahr', 'previousyear', 'vj']);
    const iBudget = getCol(['budget', 'plan', 'soll']);

    if (iAccNo === -1 || iAccName === -1 || iYear === -1 || iMonth === -1 || iAmount === -1) {
      return NextResponse.json({
        error: 'Pflichtfelder fehlen. Erwartet: Kontonummer, Kontoname, Jahr, Monat, Betrag',
        foundHeaders: header,
      }, { status: 400 });
    }

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(separator).map(c => c.trim());
      try {
        const accountNumber = cols[iAccNo];
        const accountName = cols[iAccName];
        const year = parseInt(cols[iYear]);
        const month = parseInt(cols[iMonth]);
        const amount = parseFloat(cols[iAmount]?.replace(/\./g, '').replace(',', '.') || '0');
        const previousYear = iPrevYear >= 0 ? parseFloat(cols[iPrevYear]?.replace(/\./g, '').replace(',', '.') || '0') : 0;
        const budget = iBudget >= 0 ? parseFloat(cols[iBudget]?.replace(/\./g, '').replace(',', '.') || '0') : 0;
        const category = iCategory >= 0 ? cols[iCategory] || 'Sonstiges' : 'Sonstiges';

        if (!accountNumber || !accountName || isNaN(year) || isNaN(month) || isNaN(amount)) {
          skipped++;
          errors.push(`Zeile ${i + 1}: Ungültige Daten`);
          continue;
        }

        await prisma.financialAccount.upsert({
          where: { accountNumber_year_month: { accountNumber, year, month } },
          update: { accountName, category, amount, previousYear, budget },
          create: { accountNumber, accountName, category, year, month, amount, previousYear, budget },
        });
        imported++;
      } catch (err: any) {
        skipped++;
        errors.push(`Zeile ${i + 1}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      total: lines.length - 1,
      errors: errors.slice(0, 10),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
