import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const customers = [
  { id: 'alpha', name: 'Alpha Dynamics GmbH', shortName: 'Alpha', industry: 'Energy Technology' },
  { id: 'nexatech', name: 'NexaTech AG', shortName: 'NexaTech', industry: 'Healthcare IT' },
  { id: 'corebit', name: 'CoreBit Solutions', shortName: 'CoreBit', industry: 'Financial Technology' },
  { id: 'stratton', name: 'Stratton Capital GmbH', shortName: 'Stratton', industry: 'Asset Management' },
  { id: 'aquaverde', name: 'AquaVerde Werke', shortName: 'AquaVerde', industry: 'Utilities' },
  { id: 'vantara', name: 'Vantara Digital', shortName: 'Vantara', industry: 'Technology' },
];

const employees = [
  { id: 'emp01', firstName: 'Lukas', lastName: 'Bergmann', contractType: 'Hybrid', experienceLevel: 'Senior', monthlyIncome: 6800, homeOfficePercent: 55 },
  { id: 'emp02', firstName: 'Mirko', lastName: 'Petrov', contractType: 'Remote', experienceLevel: 'Senior', monthlyIncome: 7200, homeOfficePercent: 90 },
  { id: 'emp03', firstName: 'Tobias', lastName: 'Lenz', contractType: 'Hybrid', experienceLevel: 'Lead', monthlyIncome: 8500, homeOfficePercent: 60 },
  { id: 'emp04', firstName: 'Jan', lastName: 'Nowak', contractType: 'Remote', experienceLevel: 'Mid', monthlyIncome: 5500, homeOfficePercent: 85 },
  { id: 'emp05', firstName: 'Felix', lastName: 'Kramer', contractType: 'Office', experienceLevel: 'Mid', monthlyIncome: 5200, homeOfficePercent: 30 },
  { id: 'emp06', firstName: 'Nils', lastName: 'Reuter', contractType: 'Remote', experienceLevel: 'Senior', monthlyIncome: 6900, homeOfficePercent: 80 },
  { id: 'emp07', firstName: 'Marco', lastName: 'Seidel', contractType: 'Hybrid', experienceLevel: 'Mid', monthlyIncome: 5400, homeOfficePercent: 50 },
  { id: 'emp08', firstName: 'Paul', lastName: 'Voigt', contractType: 'Remote', experienceLevel: 'Senior', monthlyIncome: 7100, homeOfficePercent: 75 },
  { id: 'emp09', firstName: 'Leon', lastName: 'Hauser', contractType: 'Hybrid', experienceLevel: 'Mid', monthlyIncome: 5600, homeOfficePercent: 45 },
  { id: 'emp10', firstName: 'Tim', lastName: 'Dietrich', contractType: 'Office', experienceLevel: 'Junior', monthlyIncome: 4200, homeOfficePercent: 20 },
  { id: 'emp11', firstName: 'Viktor', lastName: 'Stein', contractType: 'Remote', experienceLevel: 'Senior', monthlyIncome: 7000, homeOfficePercent: 70 },
  { id: 'emp12', firstName: 'Stefan', lastName: 'Hartung', contractType: 'Hybrid', experienceLevel: 'Lead', monthlyIncome: 8200, homeOfficePercent: 65 },
  { id: 'emp13', firstName: 'Robert', lastName: 'Fiedler', contractType: 'Remote', experienceLevel: 'Senior', monthlyIncome: 7500, homeOfficePercent: 88 },
  { id: 'emp14', firstName: 'Kai', lastName: 'Lindner', contractType: 'Hybrid', experienceLevel: 'Mid', monthlyIncome: 5300, homeOfficePercent: 55 },
  { id: 'emp15', firstName: 'Jens', lastName: 'Roth', contractType: 'Office', experienceLevel: 'Senior', monthlyIncome: 6600, homeOfficePercent: 25 },
  { id: 'emp16', firstName: 'Florian', lastName: 'Bauer', contractType: 'Remote', experienceLevel: 'Mid', monthlyIncome: 5800, homeOfficePercent: 82 },
  { id: 'emp17', firstName: 'Rafael', lastName: 'Costa', contractType: 'Remote', experienceLevel: 'Senior', monthlyIncome: 7400, homeOfficePercent: 92 },
  { id: 'emp18', firstName: 'Matthias', lastName: 'Kessler', contractType: 'Hybrid', experienceLevel: 'Lead', monthlyIncome: 8800, homeOfficePercent: 50 },
  { id: 'emp19', firstName: 'Lena', lastName: 'Schreiber', contractType: 'Remote', experienceLevel: 'Senior', monthlyIncome: 7300, homeOfficePercent: 78 },
  { id: 'emp20', firstName: 'Dominik', lastName: 'Riedel', contractType: 'Office', experienceLevel: 'Mid', monthlyIncome: 5100, homeOfficePercent: 30 },
  { id: 'emp21', firstName: 'Elena', lastName: 'Kraft', contractType: 'Hybrid', experienceLevel: 'Junior', monthlyIncome: 4500, homeOfficePercent: 40 },
  { id: 'emp22', firstName: 'Henrik', lastName: 'Wald', contractType: 'Remote', experienceLevel: 'Senior', monthlyIncome: 6700, homeOfficePercent: 85 },
  { id: 'emp23', firstName: 'Carla', lastName: 'Moser', contractType: 'Hybrid', experienceLevel: 'Mid', monthlyIncome: 5900, homeOfficePercent: 55 },
  { id: 'emp24', firstName: 'David', lastName: 'Pohl', contractType: 'Office', experienceLevel: 'Junior', monthlyIncome: 4100, homeOfficePercent: 15 },
  { id: 'emp25', firstName: 'Alina', lastName: 'Naumann', contractType: 'Remote', experienceLevel: 'Mid', monthlyIncome: 5700, homeOfficePercent: 72 },
  { id: 'emp26', firstName: 'Timo', lastName: 'Gerlach', contractType: 'Hybrid', experienceLevel: 'Senior', monthlyIncome: 7100, homeOfficePercent: 60 },
  { id: 'emp27', firstName: 'Simon', lastName: 'Wirth', contractType: 'Remote', experienceLevel: 'Mid', monthlyIncome: 5500, homeOfficePercent: 80 },
];

const projects = [
  { id: 'proj-alpha-1', name: '2026-Q1-1-Plattform Core', customerId: 'alpha', purchaseOrder: 'PO-2026-001', hourlyRate: 95, budgetHours: 2000 },
  { id: 'proj-alpha-2', name: '2026-Q1-2-Plattform Infra', customerId: 'alpha', purchaseOrder: 'PO-2026-002', hourlyRate: 93, budgetHours: 1500 },
  { id: 'proj-nexa', name: 'NexaTech ERP Migration', customerId: 'nexatech', purchaseOrder: 'PO-2026-003', hourlyRate: 90, budgetHours: 1200 },
  { id: 'proj-core-1', name: 'CoreBit PPM', customerId: 'corebit', purchaseOrder: 'PO-2026-004', hourlyRate: 98, budgetHours: 1800 },
  { id: 'proj-core-2', name: 'CoreBit Agile Suite', customerId: 'corebit', purchaseOrder: 'PO-2026-005', hourlyRate: 95, budgetHours: 1600 },
  { id: 'proj-strat', name: 'Stratton Analytics', customerId: 'stratton', purchaseOrder: 'PO-2026-006', hourlyRate: 88, budgetHours: 1000 },
  { id: 'proj-aqua', name: 'AquaVerde Kundenportal', customerId: 'aquaverde', purchaseOrder: 'PO-2026-007', hourlyRate: 85, budgetHours: 800 },
  { id: 'proj-vant', name: 'Vantara App Development', customerId: 'vantara', purchaseOrder: 'PO-2026-008', hourlyRate: 92, budgetHours: 600 },
];

// Customer-Employee assignments
const assignments = [
  { employeeId: 'emp04', customerId: 'alpha', hourlyRate: 95 },
  { employeeId: 'emp08', customerId: 'alpha', hourlyRate: 93 },
  { employeeId: 'emp06', customerId: 'alpha', hourlyRate: 95 },
  { employeeId: 'emp13', customerId: 'alpha', hourlyRate: 93 },
  { employeeId: 'emp12', customerId: 'alpha', hourlyRate: 98 },
  { employeeId: 'emp17', customerId: 'alpha', hourlyRate: 93 },
  { employeeId: 'emp10', customerId: 'alpha', hourlyRate: 85 },
  { employeeId: 'emp15', customerId: 'alpha', hourlyRate: 95 },
  { employeeId: 'emp01', customerId: 'nexatech', hourlyRate: 90 },
  { employeeId: 'emp02', customerId: 'nexatech', hourlyRate: 90 },
  { employeeId: 'emp07', customerId: 'nexatech', hourlyRate: 88 },
  { employeeId: 'emp09', customerId: 'corebit', hourlyRate: 98 },
  { employeeId: 'emp14', customerId: 'corebit', hourlyRate: 95 },
  { employeeId: 'emp05', customerId: 'corebit', hourlyRate: 95 },
  { employeeId: 'emp11', customerId: 'corebit', hourlyRate: 98 },
  { employeeId: 'emp03', customerId: 'stratton', hourlyRate: 88 },
  { employeeId: 'emp18', customerId: 'stratton', hourlyRate: 92 },
  { employeeId: 'emp19', customerId: 'stratton', hourlyRate: 88 },
  { employeeId: 'emp20', customerId: 'aquaverde', hourlyRate: 85 },
  { employeeId: 'emp21', customerId: 'aquaverde', hourlyRate: 82 },
  { employeeId: 'emp22', customerId: 'aquaverde', hourlyRate: 85 },
  { employeeId: 'emp23', customerId: 'vantara', hourlyRate: 92 },
  { employeeId: 'emp24', customerId: 'vantara', hourlyRate: 85 },
  { employeeId: 'emp25', customerId: 'vantara', hourlyRate: 90 },
  { employeeId: 'emp26', customerId: 'vantara', hourlyRate: 92 },
  { employeeId: 'emp27', customerId: 'vantara', hourlyRate: 88 },
  { employeeId: 'emp16', customerId: 'nexatech', hourlyRate: 90 },
];

function randomBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

async function main() {
  console.log('Seeding users...');
  const testPw = await bcrypt.hash('johndoe123', 12);
  const adminPw = await bcrypt.hash('PulseBI2026!', 12);
  await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: { email: 'john@doe.com', password: testPw, name: 'Test Admin', role: 'admin' },
  });
  await prisma.user.upsert({
    where: { email: 'admin@pulsebi.de' },
    update: {},
    create: { email: 'admin@pulsebi.de', password: adminPw, name: 'Admin', role: 'admin' },
  });

  console.log('Seeding customers...');
  for (const c of customers) {
    await prisma.customer.upsert({
      where: { id: c.id },
      update: { name: c.name, shortName: c.shortName, industry: c.industry },
      create: c,
    });
  }

  console.log('Seeding employees...');
  for (const e of employees) {
    await prisma.employee.upsert({
      where: { id: e.id },
      update: { ...e, startDate: new Date('2023-01-15'), weeklyHours: 40 },
      create: { ...e, startDate: new Date('2023-01-15'), weeklyHours: 40 },
    });
  }

  console.log('Seeding projects...');
  for (const p of projects) {
    await prisma.project.upsert({
      where: { id: p.id },
      update: p,
      create: { ...p, startDate: new Date('2026-01-01') },
    });
  }

  console.log('Seeding employee assignments...');
  for (const a of assignments) {
    const id = `${a.employeeId}-${a.customerId}`;
    await prisma.employeeAssignment.upsert({
      where: { id },
      update: a,
      create: { id, ...a, startDate: new Date('2026-01-01'), allocation: 100 },
    });
  }

  console.log('Seeding time entries...');
  const months2026 = [0, 1, 2]; // Jan, Feb, Mar 2026
  const months2025 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  
  for (const emp of employees) {
    const assignment = assignments.find((a: any) => a.employeeId === emp.id);
    if (!assignment) continue;
    
    // 2025 data
    for (const m of months2025) {
      const workDays = randomBetween(18, 22);
      const billableRatio = randomBetween(0.78, 0.96);
      const totalHours = workDays * 8;
      const billable = Math.round(totalHours * billableRatio);
      const entryId = `te-${emp.id}-2025-${m}`;
      
      await prisma.timeEntry.upsert({
        where: { id: entryId },
        update: {},
        create: {
          id: entryId,
          employeeId: emp.id,
          customerId: assignment.customerId,
          date: new Date(2025, m, 15),
          hours: totalHours,
          billableHours: billable,
          isBillable: true,
          workLocation: Math.random() > 0.5 ? 'HomeOffice' : 'InOffice',
        },
      });
    }
    
    // 2026 data
    for (const m of months2026) {
      const workDays = randomBetween(19, 22);
      const billableRatio = randomBetween(0.85, 0.98);
      const totalHours = workDays * 8;
      const billable = Math.round(totalHours * billableRatio);
      const entryId = `te-${emp.id}-2026-${m}`;
      
      await prisma.timeEntry.upsert({
        where: { id: entryId },
        update: {},
        create: {
          id: entryId,
          employeeId: emp.id,
          customerId: assignment.customerId,
          date: new Date(2026, m, 15),
          hours: totalHours,
          billableHours: billable,
          isBillable: true,
          workLocation: Math.random() > 0.5 ? 'HomeOffice' : 'InOffice',
        },
      });
    }
  }

  console.log('Seeding absences...');
  for (const emp of employees) {
    // Vacation
    const vacId = `abs-vac-${emp.id}-2026`;
    await prisma.absence.upsert({
      where: { id: vacId },
      update: {},
      create: {
        id: vacId,
        employeeId: emp.id,
        type: 'Urlaub',
        startDate: new Date(2026, 1, 10),
        endDate: new Date(2026, 1, 14),
        days: randomBetween(3, 8),
      },
    });
    // Sick
    if (Math.random() > 0.4) {
      const sickId = `abs-sick-${emp.id}-2026`;
      await prisma.absence.upsert({
        where: { id: sickId },
        update: {},
        create: {
          id: sickId,
          employeeId: emp.id,
          type: 'Krank',
          startDate: new Date(2026, 0, 20),
          endDate: new Date(2026, 0, 22),
          days: randomBetween(1, 5),
        },
      });
    }
  }

  console.log('Seeding financial accounts (BWA)...');
  const bwaAccounts = [
    { num: '1020', name: 'Umsatzerl\u00f6se', cat: 'Umsatzerl\u00f6se' },
    { num: '1032', name: 'Refinancing', cat: 'Umsatzerl\u00f6se' },
    { num: '1092', name: 'Betriebl. Rohertrag', cat: 'Rohertrag' },
    { num: '1260', name: 'Gesamtkosten', cat: 'Gesamtkosten' },
    { num: '1270', name: 'Betriebsergebnis', cat: 'Betriebsergebnis' },
    { num: '1280', name: 'Neutraler Aufwand', cat: 'Neutral' },
    { num: '1290', name: 'Neutraler Ertrag', cat: 'Neutral' },
    { num: '1300', name: 'Ergebnis vor Steuern', cat: 'Ergebnis' },
    { num: '1310', name: 'Steuern Flink.u.Ertg', cat: 'Steuern' },
    { num: '1320', name: 'Vorl\u00e4ufiges Ergebnis', cat: 'Ergebnis' },
  ];

  const years = [2024, 2025, 2026];
  for (const year of years) {
    const monthsInYear = year === 2026 ? [1, 2, 3] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    for (const month of monthsInYear) {
      const seasonFactor = 1 + 0.1 * Math.sin((month - 1) * Math.PI / 6);
      const yearGrowth = year === 2024 ? 1.0 : year === 2025 ? 1.12 : 1.18;
      
      // Revenue base ~250-350k/month
      const revenueBase = randomBetween(250000, 350000) * seasonFactor * yearGrowth;
      
      for (const acc of bwaAccounts) {
        let amount = 0;
        let prevYear = 0;
        switch (acc.num) {
          case '1020': amount = revenueBase; prevYear = revenueBase * 0.88; break;
          case '1032': amount = revenueBase * 0.05; prevYear = revenueBase * 0.04; break;
          case '1092': amount = revenueBase * randomBetween(0.45, 0.55); prevYear = revenueBase * 0.5; break;
          case '1260': amount = revenueBase * randomBetween(0.38, 0.48); prevYear = revenueBase * 0.42; break;
          case '1270': amount = revenueBase * randomBetween(0.05, 0.12); prevYear = revenueBase * 0.08; break;
          case '1280': amount = randomBetween(500, 3000); prevYear = randomBetween(500, 3000); break;
          case '1290': amount = randomBetween(2000, 10000); prevYear = randomBetween(2000, 10000); break;
          case '1300': amount = revenueBase * randomBetween(0.06, 0.13); prevYear = revenueBase * 0.09; break;
          case '1310': amount = randomBetween(200, 1500); prevYear = randomBetween(200, 1500); break;
          case '1320': amount = revenueBase * randomBetween(0.05, 0.12); prevYear = revenueBase * 0.085; break;
        }
        
        await prisma.financialAccount.upsert({
          where: { accountNumber_year_month: { accountNumber: acc.num, year, month } },
          update: { amount, previousYear: prevYear },
          create: {
            accountNumber: acc.num,
            accountName: acc.name,
            category: acc.cat,
            year,
            month,
            amount: Math.round(amount * 100) / 100,
            previousYear: Math.round(prevYear * 100) / 100,
            budget: Math.round(amount * randomBetween(0.95, 1.05) * 100) / 100,
          },
        });
      }
    }
  }

  console.log('Seeding personnel costs...');
  for (const emp of employees) {
    for (const year of [2025, 2026]) {
      const months = year === 2026 ? [1, 2, 3] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      for (const month of months) {
        const gross = (emp.monthlyIncome ?? 5000) * randomBetween(0.97, 1.03);
        const social = gross * 0.21;
        const other = randomBetween(100, 500);
        await prisma.personnelCost.upsert({
          where: { employeeId_year_month: { employeeId: emp.id, year, month } },
          update: {},
          create: {
            employeeId: emp.id,
            year,
            month,
            grossSalary: Math.round(gross * 100) / 100,
            socialCosts: Math.round(social * 100) / 100,
            otherCosts: Math.round(other * 100) / 100,
            totalCost: Math.round((gross + social + other) * 100) / 100,
          },
        });
      }
    }
  }

  console.log('Seeding invoices...');
  let invoiceCounter = 1;
  for (const cust of customers) {
    for (const m of [1, 2, 3]) {
      const invId = `inv-${cust.id}-2026-${m}`;
      const amount = randomBetween(30000, 120000);
      const paid = Math.random() > 0.3 ? amount : amount * randomBetween(0, 0.8);
      await prisma.invoice.upsert({
        where: { id: invId },
        update: {},
        create: {
          id: invId,
          customerId: cust.id,
          invoiceNo: `INV-2026-${String(invoiceCounter++).padStart(4, '0')}`,
          issueDate: new Date(2026, m - 1, 1),
          dueDate: new Date(2026, m - 1, 28),
          totalAmount: Math.round(amount * 100) / 100,
          paidAmount: Math.round(paid * 100) / 100,
          status: paid >= amount ? 'paid' : paid > 0 ? 'partial' : 'open',
        },
      });
    }
  }

  console.log('Seeding open items...');
  for (const cust of customers) {
    for (const m of [1, 2, 3]) {
      const oiId = `oi-${cust.id}-2026-${m}`;
      await prisma.openItem.upsert({
        where: { id: oiId },
        update: {},
        create: {
          id: oiId,
          customerId: cust.id,
          type: 'Forderung',
          amount: randomBetween(20000, 100000),
          year: 2026,
          month: m,
          dueDate: new Date(2026, m, 15),
        },
      });
    }
  }

  console.log('Seeding cashflow...');
  let cumulative = 0;
  for (const year of [2025, 2026]) {
    const months = year === 2026 ? [1, 2, 3] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    for (const month of months) {
      const inflow = randomBetween(280000, 380000);
      const outflow = randomBetween(240000, 340000);
      const balance = inflow - outflow;
      cumulative += balance;
      await prisma.cashflowEntry.upsert({
        where: { year_month: { year, month } },
        update: {},
        create: { year, month, inflow: Math.round(inflow), outflow: Math.round(outflow), balance: Math.round(balance), cumulative: Math.round(cumulative) },
      });
    }
  }

  console.log('Seeding financial planning...');
  const planCategories = ['Umsatz', 'Personalkosten', 'Betriebskosten', 'Betriebsergebnis', 'Auslastung'];
  for (const cat of planCategories) {
    for (const m of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
      let planned = 0, actual = 0;
      switch (cat) {
        case 'Umsatz': planned = randomBetween(300000, 380000); actual = m <= 3 ? planned * randomBetween(0.9, 1.1) : 0; break;
        case 'Personalkosten': planned = randomBetween(180000, 220000); actual = m <= 3 ? planned * randomBetween(0.95, 1.05) : 0; break;
        case 'Betriebskosten': planned = randomBetween(30000, 50000); actual = m <= 3 ? planned * randomBetween(0.9, 1.15) : 0; break;
        case 'Betriebsergebnis': planned = randomBetween(25000, 60000); actual = m <= 3 ? planned * randomBetween(0.8, 1.2) : 0; break;
        case 'Auslastung': planned = 92; actual = m <= 3 ? randomBetween(85, 98) : 0; break;
      }
      await prisma.financialPlanning.upsert({
        where: { category_year_month: { category: cat, year: 2026, month: m } },
        update: {},
        create: { category: cat, year: 2026, month: m, planned: Math.round(planned * 100) / 100, actual: Math.round(actual * 100) / 100, forecast: Math.round(planned * randomBetween(0.95, 1.05) * 100) / 100 },
      });
    }
  }

  console.log('Seeding user reports...');
  for (const emp of employees) {
    for (const year of [2025, 2026]) {
      const months = year === 2026 ? [1, 2, 3] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      for (const month of months) {
        const target = randomBetween(160, 176);
        const actual = target * randomBetween(0.9, 1.05);
        const billable = actual * randomBetween(0.82, 0.98);
        const sick = Math.random() > 0.7 ? randomBetween(1, 5) : 0;
        const vacation = Math.random() > 0.6 ? randomBetween(1, 5) : 0;
        await prisma.userReport.upsert({
          where: { employeeId_year_month: { employeeId: emp.id, year, month } },
          update: {},
          create: {
            employeeId: emp.id,
            year,
            month,
            targetHours: Math.round(target * 100) / 100,
            actualHours: Math.round(actual * 100) / 100,
            billableHours: Math.round(billable * 100) / 100,
            sickDays: Math.round(sick * 100) / 100,
            vacationDays: Math.round(vacation * 100) / 100,
            utilization: Math.round((billable / target) * 10000) / 100,
          },
        });
      }
    }
  }

  console.log('Seeding holidays...');
  const holidays2026 = [
    { name: 'Neujahr', date: new Date(2026, 0, 1) },
    { name: 'Karfreitag', date: new Date(2026, 3, 3) },
    { name: 'Ostermontag', date: new Date(2026, 3, 6) },
    { name: 'Tag der Arbeit', date: new Date(2026, 4, 1) },
    { name: 'Christi Himmelfahrt', date: new Date(2026, 4, 14) },
    { name: 'Pfingstmontag', date: new Date(2026, 4, 25) },
    { name: 'Tag der Deutschen Einheit', date: new Date(2026, 9, 3) },
    { name: 'Weihnachten', date: new Date(2026, 11, 25) },
    { name: '2. Weihnachtstag', date: new Date(2026, 11, 26) },
  ];
  for (const h of holidays2026) {
    await prisma.holiday.upsert({
      where: { name_date: { name: h.name, date: h.date } },
      update: {},
      create: { ...h, region: 'DE' },
    });
  }

  console.log('Seed complete!');
}

main()
  .catch((e: any) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
