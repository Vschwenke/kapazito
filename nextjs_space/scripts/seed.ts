import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ============================================================
// STAMMDATEN
// ============================================================

const customers = [
  { id: 'alpha', name: 'Alpha Dynamics GmbH', shortName: 'Alpha', industry: 'Energy Technology' },
  { id: 'nexatech', name: 'NexaTech AG', shortName: 'NexaTech', industry: 'Healthcare IT' },
  { id: 'corebit', name: 'CoreBit Solutions', shortName: 'CoreBit', industry: 'Financial Technology' },
  { id: 'stratton', name: 'Stratton Capital GmbH', shortName: 'Stratton', industry: 'Asset Management' },
  { id: 'aquaverde', name: 'AquaVerde Werke', shortName: 'AquaVerde', industry: 'Utilities' },
  { id: 'vantara', name: 'Vantara Digital', shortName: 'Vantara', industry: 'Technology' },
  { id: 'meridian', name: 'Meridian Consulting AG', shortName: 'Meridian', industry: 'Management Consulting' },
  { id: 'luminar', name: 'Luminar Systems GmbH', shortName: 'Luminar', industry: 'Cloud Infrastructure' },
];

const employees = [
  { id: 'emp01', firstName: 'Lukas', lastName: 'Bergmann', email: 'l.bergmann@serviceiq.de', contractType: 'Hybrid', experienceLevel: 'Senior', monthlyIncome: 6800, homeOfficePercent: 55 },
  { id: 'emp02', firstName: 'Mirko', lastName: 'Petrov', email: 'm.petrov@serviceiq.de', contractType: 'Remote', experienceLevel: 'Senior', monthlyIncome: 7200, homeOfficePercent: 90 },
  { id: 'emp03', firstName: 'Tobias', lastName: 'Lenz', email: 't.lenz@serviceiq.de', contractType: 'Hybrid', experienceLevel: 'Lead', monthlyIncome: 8500, homeOfficePercent: 60 },
  { id: 'emp04', firstName: 'Jan', lastName: 'Nowak', email: 'j.nowak@serviceiq.de', contractType: 'Remote', experienceLevel: 'Mid', monthlyIncome: 5500, homeOfficePercent: 85 },
  { id: 'emp05', firstName: 'Felix', lastName: 'Kramer', email: 'f.kramer@serviceiq.de', contractType: 'Office', experienceLevel: 'Mid', monthlyIncome: 5200, homeOfficePercent: 30 },
  { id: 'emp06', firstName: 'Nils', lastName: 'Reuter', email: 'n.reuter@serviceiq.de', contractType: 'Remote', experienceLevel: 'Senior', monthlyIncome: 6900, homeOfficePercent: 80 },
  { id: 'emp07', firstName: 'Marco', lastName: 'Seidel', email: 'm.seidel@serviceiq.de', contractType: 'Hybrid', experienceLevel: 'Mid', monthlyIncome: 5400, homeOfficePercent: 50 },
  { id: 'emp08', firstName: 'Paul', lastName: 'Voigt', email: 'p.voigt@serviceiq.de', contractType: 'Remote', experienceLevel: 'Senior', monthlyIncome: 7100, homeOfficePercent: 75 },
  { id: 'emp09', firstName: 'Leon', lastName: 'Hauser', email: 'l.hauser@serviceiq.de', contractType: 'Hybrid', experienceLevel: 'Mid', monthlyIncome: 5600, homeOfficePercent: 45 },
  { id: 'emp10', firstName: 'Tim', lastName: 'Dietrich', email: 't.dietrich@serviceiq.de', contractType: 'Office', experienceLevel: 'Junior', monthlyIncome: 4200, homeOfficePercent: 20 },
  { id: 'emp11', firstName: 'Viktor', lastName: 'Stein', email: 'v.stein@serviceiq.de', contractType: 'Remote', experienceLevel: 'Senior', monthlyIncome: 7000, homeOfficePercent: 70 },
  { id: 'emp12', firstName: 'Stefan', lastName: 'Hartung', email: 's.hartung@serviceiq.de', contractType: 'Hybrid', experienceLevel: 'Lead', monthlyIncome: 8200, homeOfficePercent: 65 },
  { id: 'emp13', firstName: 'Robert', lastName: 'Fiedler', email: 'r.fiedler@serviceiq.de', contractType: 'Remote', experienceLevel: 'Senior', monthlyIncome: 7500, homeOfficePercent: 88 },
  { id: 'emp14', firstName: 'Kai', lastName: 'Lindner', email: 'k.lindner@serviceiq.de', contractType: 'Hybrid', experienceLevel: 'Mid', monthlyIncome: 5300, homeOfficePercent: 55 },
  { id: 'emp15', firstName: 'Jens', lastName: 'Roth', email: 'j.roth@serviceiq.de', contractType: 'Office', experienceLevel: 'Senior', monthlyIncome: 6600, homeOfficePercent: 25 },
  { id: 'emp16', firstName: 'Florian', lastName: 'Bauer', email: 'f.bauer@serviceiq.de', contractType: 'Remote', experienceLevel: 'Mid', monthlyIncome: 5800, homeOfficePercent: 82 },
  { id: 'emp17', firstName: 'Rafael', lastName: 'Costa', email: 'r.costa@serviceiq.de', contractType: 'Remote', experienceLevel: 'Senior', monthlyIncome: 7400, homeOfficePercent: 92 },
  { id: 'emp18', firstName: 'Matthias', lastName: 'Kessler', email: 'm.kessler@serviceiq.de', contractType: 'Hybrid', experienceLevel: 'Lead', monthlyIncome: 8800, homeOfficePercent: 50 },
  { id: 'emp19', firstName: 'Lena', lastName: 'Schreiber', email: 'l.schreiber@serviceiq.de', contractType: 'Remote', experienceLevel: 'Senior', monthlyIncome: 7300, homeOfficePercent: 78 },
  { id: 'emp20', firstName: 'Dominik', lastName: 'Riedel', email: 'd.riedel@serviceiq.de', contractType: 'Office', experienceLevel: 'Mid', monthlyIncome: 5100, homeOfficePercent: 30 },
  { id: 'emp21', firstName: 'Elena', lastName: 'Kraft', email: 'e.kraft@serviceiq.de', contractType: 'Hybrid', experienceLevel: 'Junior', monthlyIncome: 4500, homeOfficePercent: 40 },
  { id: 'emp22', firstName: 'Henrik', lastName: 'Wald', email: 'h.wald@serviceiq.de', contractType: 'Remote', experienceLevel: 'Senior', monthlyIncome: 6700, homeOfficePercent: 85 },
  { id: 'emp23', firstName: 'Carla', lastName: 'Moser', email: 'c.moser@serviceiq.de', contractType: 'Hybrid', experienceLevel: 'Mid', monthlyIncome: 5900, homeOfficePercent: 55 },
  { id: 'emp24', firstName: 'David', lastName: 'Pohl', email: 'd.pohl@serviceiq.de', contractType: 'Office', experienceLevel: 'Junior', monthlyIncome: 4100, homeOfficePercent: 15 },
  { id: 'emp25', firstName: 'Alina', lastName: 'Naumann', email: 'a.naumann@serviceiq.de', contractType: 'Remote', experienceLevel: 'Mid', monthlyIncome: 5700, homeOfficePercent: 72 },
  { id: 'emp26', firstName: 'Timo', lastName: 'Gerlach', email: 't.gerlach@serviceiq.de', contractType: 'Hybrid', experienceLevel: 'Senior', monthlyIncome: 7100, homeOfficePercent: 60 },
  { id: 'emp27', firstName: 'Simon', lastName: 'Wirth', email: 's.wirth@serviceiq.de', contractType: 'Remote', experienceLevel: 'Mid', monthlyIncome: 5500, homeOfficePercent: 80 },
  { id: 'emp28', firstName: 'Anna', lastName: 'Richter', email: 'a.richter@serviceiq.de', contractType: 'Hybrid', experienceLevel: 'Senior', monthlyIncome: 7000, homeOfficePercent: 65 },
  { id: 'emp29', firstName: 'Max', lastName: 'Weber', email: 'm.weber@serviceiq.de', contractType: 'Office', experienceLevel: 'Mid', monthlyIncome: 5400, homeOfficePercent: 25 },
  { id: 'emp30', firstName: 'Sophie', lastName: 'Klein', email: 's.klein@serviceiq.de', contractType: 'Remote', experienceLevel: 'Junior', monthlyIncome: 4300, homeOfficePercent: 75 },
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
  { id: 'proj-merid-1', name: 'Meridian CRM Rollout', customerId: 'meridian', purchaseOrder: 'PO-2026-009', hourlyRate: 105, budgetHours: 1400 },
  { id: 'proj-merid-2', name: 'Meridian Data Warehouse', customerId: 'meridian', purchaseOrder: 'PO-2026-010', hourlyRate: 100, budgetHours: 900 },
  { id: 'proj-lumin', name: 'Luminar Cloud Migration', customerId: 'luminar', purchaseOrder: 'PO-2026-011', hourlyRate: 110, budgetHours: 1100 },
];

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
  { employeeId: 'emp16', customerId: 'nexatech', hourlyRate: 90 },
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
  { employeeId: 'emp28', customerId: 'meridian', hourlyRate: 105 },
  { employeeId: 'emp29', customerId: 'meridian', hourlyRate: 100 },
  { employeeId: 'emp30', customerId: 'luminar', hourlyRate: 110 },
  { employeeId: 'emp19', customerId: 'luminar', hourlyRate: 108 },
];

function randomBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

// Map project to customer
const projectsByCustomer: Record<string, string[]> = {};
for (const p of projects) {
  if (!projectsByCustomer[p.customerId]) projectsByCustomer[p.customerId] = [];
  projectsByCustomer[p.customerId].push(p.id);
}

async function main() {
  console.log('\n=== ServiceIQ Demo-Daten Seed ===\n');

  // ---- USERS ----
  console.log('Seeding users...');
  const testPw = await bcrypt.hash('johndoe123', 12);
  const adminPw = await bcrypt.hash('ServiceIQ2026!', 12);
  const demoPw = await bcrypt.hash('Demo2026!', 12);
  await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: { email: 'john@doe.com', password: testPw, name: 'Test Admin', role: 'admin' },
  });
  await prisma.user.upsert({
    where: { email: 'admin@serviceiq.de' },
    update: { password: adminPw },
    create: { email: 'admin@serviceiq.de', password: adminPw, name: 'Admin', role: 'admin' },
  });
  await prisma.user.upsert({
    where: { email: 'demo@serviceiq.de' },
    update: { password: demoPw },
    create: { email: 'demo@serviceiq.de', password: demoPw, name: 'Demo User', role: 'user' },
  });

  // ---- CUSTOMERS ----
  console.log('Seeding customers...');
  for (const c of customers) {
    await prisma.customer.upsert({
      where: { id: c.id },
      update: { name: c.name, shortName: c.shortName, industry: c.industry },
      create: c,
    });
  }

  // ---- EMPLOYEES ----
  console.log('Seeding employees...');
  const startDates: Record<string, Date> = {
    emp01: new Date('2021-03-01'), emp02: new Date('2020-09-15'), emp03: new Date('2019-06-01'),
    emp04: new Date('2022-01-10'), emp05: new Date('2023-04-01'), emp06: new Date('2020-11-15'),
    emp07: new Date('2022-07-01'), emp08: new Date('2021-01-15'), emp09: new Date('2022-09-01'),
    emp10: new Date('2024-02-01'), emp11: new Date('2021-05-15'), emp12: new Date('2019-01-01'),
    emp13: new Date('2020-03-15'), emp14: new Date('2023-01-01'), emp15: new Date('2020-06-01'),
    emp16: new Date('2023-06-15'), emp17: new Date('2021-09-01'), emp18: new Date('2018-11-01'),
    emp19: new Date('2021-02-01'), emp20: new Date('2023-08-01'), emp21: new Date('2024-06-01'),
    emp22: new Date('2022-04-01'), emp23: new Date('2023-03-01'), emp24: new Date('2025-01-15'),
    emp25: new Date('2023-11-01'), emp26: new Date('2022-02-01'), emp27: new Date('2024-01-01'),
    emp28: new Date('2021-08-01'), emp29: new Date('2023-10-01'), emp30: new Date('2025-03-01'),
  };
  for (const e of employees) {
    await prisma.employee.upsert({
      where: { id: e.id },
      update: { ...e, startDate: startDates[e.id] || new Date('2023-01-15'), weeklyHours: 40 },
      create: { ...e, startDate: startDates[e.id] || new Date('2023-01-15'), weeklyHours: 40 },
    });
  }

  // ---- PROJECTS ----
  console.log('Seeding projects...');
  for (const p of projects) {
    await prisma.project.upsert({
      where: { id: p.id },
      update: p,
      create: { ...p, startDate: new Date('2026-01-01') },
    });
  }

  // ---- ASSIGNMENTS ----
  console.log('Seeding employee assignments...');
  for (const a of assignments) {
    const id = `${a.employeeId}-${a.customerId}`;
    await prisma.employeeAssignment.upsert({
      where: { id },
      update: a,
      create: { id, ...a, startDate: new Date('2026-01-01'), allocation: 100 },
    });
  }

  // ---- TIME ENTRIES (2024, 2025 full + 2026 Jan–Jun) ----
  console.log('Seeding time entries (2024-2026)...');
  for (const emp of employees) {
    const empAssignments = assignments.filter((a: any) => a.employeeId === emp.id);
    if (empAssignments.length === 0) continue;
    const assignment = empAssignments[0];
    const custProjects = projectsByCustomer[assignment.customerId] || [];
    const projectId = custProjects[0] || null;

    // 2024 full year
    for (let m = 0; m < 12; m++) {
      const workDays = randomBetween(18, 22);
      const billableRatio = randomBetween(0.75, 0.93);
      const totalHours = workDays * 8;
      const billable = Math.round(totalHours * billableRatio);
      const entryId = `te-${emp.id}-2024-${m}`;
      await prisma.timeEntry.upsert({
        where: { id: entryId },
        update: {},
        create: {
          id: entryId, employeeId: emp.id, customerId: assignment.customerId,
          projectId, date: new Date(2024, m, 15),
          hours: totalHours, billableHours: billable, isBillable: true,
          description: `Projektarbeit ${new Date(2024, m).toLocaleString('de-DE', { month: 'long' })} 2024`,
          workLocation: Math.random() > 0.5 ? 'HomeOffice' : 'InOffice',
        },
      });
    }
    // 2025 full year
    for (let m = 0; m < 12; m++) {
      const workDays = randomBetween(18, 22);
      const billableRatio = randomBetween(0.78, 0.96);
      const totalHours = workDays * 8;
      const billable = Math.round(totalHours * billableRatio);
      const entryId = `te-${emp.id}-2025-${m}`;
      await prisma.timeEntry.upsert({
        where: { id: entryId },
        update: {},
        create: {
          id: entryId, employeeId: emp.id, customerId: assignment.customerId,
          projectId, date: new Date(2025, m, 15),
          hours: totalHours, billableHours: billable, isBillable: true,
          description: `Projektarbeit ${new Date(2025, m).toLocaleString('de-DE', { month: 'long' })} 2025`,
          workLocation: Math.random() > 0.5 ? 'HomeOffice' : 'InOffice',
        },
      });
    }
    // 2026 Jan–Jun
    for (let m = 0; m < 6; m++) {
      const workDays = randomBetween(19, 22);
      const billableRatio = randomBetween(0.85, 0.98);
      const totalHours = workDays * 8;
      const billable = Math.round(totalHours * billableRatio);
      const entryId = `te-${emp.id}-2026-${m}`;
      await prisma.timeEntry.upsert({
        where: { id: entryId },
        update: {},
        create: {
          id: entryId, employeeId: emp.id, customerId: assignment.customerId,
          projectId, date: new Date(2026, m, 15),
          hours: totalHours, billableHours: billable, isBillable: true,
          description: `Projektarbeit ${new Date(2026, m).toLocaleString('de-DE', { month: 'long' })} 2026`,
          workLocation: Math.random() > 0.5 ? 'HomeOffice' : 'InOffice',
        },
      });
    }
  }

  // ---- ABSENCES (realistic: multiple per year, diverse types) ----
  console.log('Seeding absences...');
  const absencePatterns = [
    // 2025
    { suffix: '2025-urlaub1', type: 'Urlaub', startM: 2, startD: 17, endM: 2, endD: 28, days: 8, year: 2025 },
    { suffix: '2025-urlaub2', type: 'Urlaub', startM: 6, startD: 14, endM: 6, endD: 25, days: 8, year: 2025 },
    { suffix: '2025-urlaub3', type: 'Urlaub', startM: 11, startD: 22, endM: 11, endD: 31, days: 6, year: 2025 },
    { suffix: '2025-krank1', type: 'Krank', startM: 0, startD: 13, endM: 0, endD: 15, days: 3, year: 2025, prob: 0.5 },
    { suffix: '2025-krank2', type: 'Krank', startM: 9, startD: 6, endM: 9, endD: 8, days: 3, year: 2025, prob: 0.35 },
    // 2026
    { suffix: '2026-urlaub1', type: 'Urlaub', startM: 1, startD: 9, endM: 1, endD: 13, days: 5, year: 2026 },
    { suffix: '2026-urlaub2', type: 'Urlaub', startM: 3, startD: 7, endM: 3, endD: 10, days: 4, year: 2026 },
    { suffix: '2026-urlaub3', type: 'Urlaub', startM: 5, startD: 15, endM: 5, endD: 26, days: 8, year: 2026 },
    { suffix: '2026-krank1', type: 'Krank', startM: 0, startD: 20, endM: 0, endD: 22, days: 3, year: 2026, prob: 0.55 },
    { suffix: '2026-krank2', type: 'Krank', startM: 2, startD: 9, endM: 2, endD: 11, days: 3, year: 2026, prob: 0.3 },
    { suffix: '2026-krank3', type: 'Krank', startM: 4, startD: 5, endM: 4, endD: 6, days: 2, year: 2026, prob: 0.25 },
    { suffix: '2026-sonstiges', type: 'Sonstiges', startM: 3, startD: 4, endM: 3, endD: 4, days: 1, year: 2026, prob: 0.15 },
  ];
  for (const emp of employees) {
    for (const pattern of absencePatterns) {
      if (pattern.prob && Math.random() > pattern.prob) continue;
      const absId = `abs-${pattern.suffix}-${emp.id}`;
      // Vary days a bit per employee
      const actualDays = pattern.type === 'Urlaub' ? pattern.days + Math.floor(Math.random() * 3) - 1 : pattern.days;
      await prisma.absence.upsert({
        where: { id: absId },
        update: {},
        create: {
          id: absId, employeeId: emp.id, type: pattern.type,
          startDate: new Date(pattern.year, pattern.startM, pattern.startD),
          endDate: new Date(pattern.year, pattern.endM, pattern.endD),
          days: Math.max(1, actualDays),
        },
      });
    }
  }

  // ---- FINANCIAL ACCOUNTS (BWA) with sub-categories ----
  console.log('Seeding financial accounts (BWA)...');
  const bwaAccounts = [
    { num: '1020', name: 'Umsatzerl\u00f6se', cat: 'Umsatzerl\u00f6se' },
    { num: '1032', name: 'Refinancing', cat: 'Umsatzerl\u00f6se' },
    { num: '1092', name: 'Betriebl. Rohertrag', cat: 'Rohertrag' },
    { num: '1100', name: 'Personalkosten', cat: 'Personalkosten' },
    { num: '1150', name: 'Sachkosten', cat: 'Sachkosten' },
    { num: '1180', name: 'Abschreibungen', cat: 'Abschreibungen' },
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
    const monthsInYear = year === 2026 ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    for (const month of monthsInYear) {
      const seasonFactor = 1 + 0.1 * Math.sin((month - 1) * Math.PI / 6);
      const yearGrowth = year === 2024 ? 1.0 : year === 2025 ? 1.12 : 1.22;
      const revenueBase = randomBetween(280000, 380000) * seasonFactor * yearGrowth;

      for (const acc of bwaAccounts) {
        let amount = 0;
        let prevYear = 0;
        switch (acc.num) {
          case '1020': amount = revenueBase; prevYear = revenueBase * 0.88; break;
          case '1032': amount = revenueBase * 0.05; prevYear = revenueBase * 0.04; break;
          case '1092': amount = revenueBase * randomBetween(0.45, 0.55); prevYear = revenueBase * 0.5; break;
          case '1100': amount = revenueBase * randomBetween(0.28, 0.35); prevYear = revenueBase * 0.32; break;
          case '1150': amount = revenueBase * randomBetween(0.06, 0.10); prevYear = revenueBase * 0.08; break;
          case '1180': amount = revenueBase * randomBetween(0.02, 0.04); prevYear = revenueBase * 0.03; break;
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
          update: { amount: Math.round(amount * 100) / 100, previousYear: Math.round(prevYear * 100) / 100 },
          create: {
            accountNumber: acc.num, accountName: acc.name, category: acc.cat,
            year, month,
            amount: Math.round(amount * 100) / 100,
            previousYear: Math.round(prevYear * 100) / 100,
            budget: Math.round(amount * randomBetween(0.95, 1.05) * 100) / 100,
          },
        });
      }
    }
  }

  // ---- PERSONNEL COSTS (2024, 2025, 2026 Jan–Jun) ----
  console.log('Seeding personnel costs...');
  for (const emp of employees) {
    for (const year of [2024, 2025, 2026]) {
      const months = year === 2026 ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      for (const month of months) {
        const raiseYear = year === 2024 ? 0.95 : year === 2025 ? 1.0 : 1.04;
        const gross = (emp.monthlyIncome ?? 5000) * raiseYear * randomBetween(0.97, 1.03);
        const social = gross * 0.21;
        const other = randomBetween(100, 500);
        await prisma.personnelCost.upsert({
          where: { employeeId_year_month: { employeeId: emp.id, year, month } },
          update: { grossSalary: Math.round(gross * 100) / 100, socialCosts: Math.round(social * 100) / 100, otherCosts: Math.round(other * 100) / 100, totalCost: Math.round((gross + social + other) * 100) / 100 },
          create: {
            employeeId: emp.id, year, month,
            grossSalary: Math.round(gross * 100) / 100,
            socialCosts: Math.round(social * 100) / 100,
            otherCosts: Math.round(other * 100) / 100,
            totalCost: Math.round((gross + social + other) * 100) / 100,
          },
        });
      }
    }
  }

  // ---- INVOICES (2025 full + 2026 Jan–Jun, multiple per customer per month) ----
  console.log('Seeding invoices...');
  let invoiceCounter = 100;
  for (const cust of customers) {
    // 2025 invoices (quarterly)
    for (const m of [1, 4, 7, 10]) {
      const invId = `inv-${cust.id}-2025-${m}`;
      const invNo = `INV-2025-${cust.shortName}-Q${Math.ceil(m/3)}`;
      const amount = randomBetween(45000, 180000);
      await prisma.invoice.upsert({
        where: { id: invId },
        update: {},
        create: {
          id: invId, customerId: cust.id,
          invoiceNo: invNo,
          issueDate: new Date(2025, m - 1, 1), dueDate: new Date(2025, m - 1, 28),
          totalAmount: Math.round(amount * 100) / 100,
          paidAmount: Math.round(amount * 100) / 100,
          status: 'paid',
        },
      });
    }
    // 2026 invoices (monthly Jan–Jun)
    for (const m of [1, 2, 3, 4, 5, 6]) {
      const invId = `inv-${cust.id}-2026-${m}`;
      const invNo = `INV-2026-${cust.shortName}-${String(m).padStart(2, '0')}`;
      const amount = randomBetween(30000, 150000);
      const isPaid = m <= 3;
      const isPartial = !isPaid && m === 4;
      const paid = isPaid ? amount : isPartial ? amount * randomBetween(0.3, 0.7) : 0;
      await prisma.invoice.upsert({
        where: { id: invId },
        update: {},
        create: {
          id: invId, customerId: cust.id,
          invoiceNo: invNo,
          issueDate: new Date(2026, m - 1, 1), dueDate: new Date(2026, m - 1, 28),
          totalAmount: Math.round(amount * 100) / 100,
          paidAmount: Math.round(paid * 100) / 100,
          status: paid >= amount ? 'paid' : paid > 0 ? 'partial' : (m <= 4 ? 'overdue' : 'open'),
        },
      });
    }
  }

  // ---- OPEN ITEMS ----
  console.log('Seeding open items...');
  for (const cust of customers) {
    for (const m of [1, 2, 3, 4, 5, 6]) {
      const oiId = `oi-${cust.id}-2026-${m}`;
      const amount = m <= 3 ? randomBetween(5000, 30000) : randomBetween(30000, 120000);
      await prisma.openItem.upsert({
        where: { id: oiId },
        update: { amount },
        create: {
          id: oiId, customerId: cust.id, type: 'Forderung',
          amount, year: 2026, month: m,
          dueDate: new Date(2026, m, 15),
        },
      });
    }
  }

  // ---- CASHFLOW (2024, 2025, 2026 Jan–Jun) ----
  console.log('Seeding cashflow...');
  let cumulative = 0;
  for (const year of [2024, 2025, 2026]) {
    const months = year === 2026 ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    for (const month of months) {
      const yearFactor = year === 2024 ? 1.0 : year === 2025 ? 1.1 : 1.2;
      const inflow = randomBetween(280000, 400000) * yearFactor;
      const outflow = randomBetween(240000, 360000) * yearFactor;
      const balance = inflow - outflow;
      cumulative += balance;
      await prisma.cashflowEntry.upsert({
        where: { year_month: { year, month } },
        update: { inflow: Math.round(inflow), outflow: Math.round(outflow), balance: Math.round(balance), cumulative: Math.round(cumulative) },
        create: { year, month, inflow: Math.round(inflow), outflow: Math.round(outflow), balance: Math.round(balance), cumulative: Math.round(cumulative) },
      });
    }
  }

  // ---- FINANCIAL PLANNING (2026 full year) ----
  console.log('Seeding financial planning...');
  const planCategories = ['Umsatz', 'Personalkosten', 'Betriebskosten', 'Betriebsergebnis', 'Auslastung'];
  for (const cat of planCategories) {
    for (const m of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
      let planned = 0, actual = 0;
      switch (cat) {
        case 'Umsatz': planned = randomBetween(320000, 420000); actual = m <= 6 ? planned * randomBetween(0.88, 1.12) : 0; break;
        case 'Personalkosten': planned = randomBetween(190000, 240000); actual = m <= 6 ? planned * randomBetween(0.95, 1.05) : 0; break;
        case 'Betriebskosten': planned = randomBetween(30000, 55000); actual = m <= 6 ? planned * randomBetween(0.85, 1.18) : 0; break;
        case 'Betriebsergebnis': planned = randomBetween(25000, 70000); actual = m <= 6 ? planned * randomBetween(0.75, 1.25) : 0; break;
        case 'Auslastung': planned = 92; actual = m <= 6 ? randomBetween(83, 98) : 0; break;
      }
      await prisma.financialPlanning.upsert({
        where: { category_year_month: { category: cat, year: 2026, month: m } },
        update: { planned: Math.round(planned * 100) / 100, actual: Math.round(actual * 100) / 100, forecast: Math.round(planned * randomBetween(0.94, 1.06) * 100) / 100 },
        create: { category: cat, year: 2026, month: m, planned: Math.round(planned * 100) / 100, actual: Math.round(actual * 100) / 100, forecast: Math.round(planned * randomBetween(0.94, 1.06) * 100) / 100 },
      });
    }
  }

  // ---- USER REPORTS ----
  console.log('Seeding user reports...');
  for (const emp of employees) {
    for (const year of [2024, 2025, 2026]) {
      const months = year === 2026 ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      for (const month of months) {
        const target = randomBetween(160, 176);
        const actual = target * randomBetween(0.88, 1.06);
        const billable = actual * randomBetween(0.80, 0.98);
        const sick = Math.random() > 0.7 ? randomBetween(1, 5) : 0;
        const vacation = Math.random() > 0.6 ? randomBetween(1, 5) : 0;
        await prisma.userReport.upsert({
          where: { employeeId_year_month: { employeeId: emp.id, year, month } },
          update: {
            targetHours: Math.round(target * 100) / 100,
            actualHours: Math.round(actual * 100) / 100,
            billableHours: Math.round(billable * 100) / 100,
            sickDays: Math.round(sick * 100) / 100,
            vacationDays: Math.round(vacation * 100) / 100,
            utilization: Math.round((billable / target) * 10000) / 100,
          },
          create: {
            employeeId: emp.id, year, month,
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

  // ---- HOLIDAYS (2025 + 2026) ----
  console.log('Seeding holidays...');
  const holidays = [
    // 2025
    { name: 'Neujahr 2025', date: new Date(2025, 0, 1) },
    { name: 'Karfreitag 2025', date: new Date(2025, 3, 18) },
    { name: 'Ostermontag 2025', date: new Date(2025, 3, 21) },
    { name: 'Tag der Arbeit 2025', date: new Date(2025, 4, 1) },
    { name: 'Christi Himmelfahrt 2025', date: new Date(2025, 4, 29) },
    { name: 'Pfingstmontag 2025', date: new Date(2025, 5, 9) },
    { name: 'Tag der Dt. Einheit 2025', date: new Date(2025, 9, 3) },
    { name: 'Weihnachten 2025', date: new Date(2025, 11, 25) },
    { name: '2. Weihnachtstag 2025', date: new Date(2025, 11, 26) },
    // 2026
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
  for (const h of holidays) {
    await prisma.holiday.upsert({
      where: { name_date: { name: h.name, date: h.date } },
      update: {},
      create: { ...h, region: 'DE' },
    });
  }

  console.log('\n=== Seed complete! ===');
  console.log(`Customers: ${customers.length}`);
  console.log(`Employees: ${employees.length}`);
  console.log(`Projects: ${projects.length}`);
  console.log(`Assignments: ${assignments.length}`);
  console.log('Time period: 2024–2026 (Jan–Jun)');
  console.log('Login: admin@serviceiq.de / ServiceIQ2026!');
  console.log('Demo:  demo@serviceiq.de / Demo2026!');
}

main()
  .catch((e: any) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
