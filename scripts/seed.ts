/**
 * Seed-Script — erzeugt einen Demo-Tenant mit Beispieldaten.
 * Aufruf: npx prisma db seed  (oder: npm run db:seed)
 */
import { PrismaClient, Role, Plan, BillingMode, TimeEntryStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { subDays } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('Seed gestartet...');

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      slug: 'demo',
      name: 'Demo-Beratung GmbH',
      legalName: 'Demo-Beratung GmbH',
      vatId: 'DE123456789',
      taxId: '123/456/78901',
      addressStreet: 'Hauptstrasse 1',
      addressZip: '10115',
      addressCity: 'Berlin',
      addressCountry: 'DE',
      iban: 'DE89 3704 0044 0532 0130 00',
      bic: 'COBADEFFXXX',
      bankName: 'Commerzbank',
      plan: Plan.PROFESSIONAL,
      defaultCurrency: 'EUR',
      locale: 'de-DE',
    },
  });
  console.log('Tenant:', tenant.name);

  const ownerPwd = await bcrypt.hash('Kapazito2026!', 12);
  const demoPwd = await bcrypt.hash('Demo2026!', 12);

  const owner = await prisma.user.upsert({
    where: { email: 'admin@kapazito.de' },
    update: { password: ownerPwd },
    create: { email: 'admin@kapazito.de', name: 'Admin', password: ownerPwd },
  });
  const demo = await prisma.user.upsert({
    where: { email: 'demo@kapazito.de' },
    update: { password: demoPwd },
    create: { email: 'demo@kapazito.de', name: 'Demo-User', password: demoPwd },
  });

  await prisma.membership.upsert({
    where: { userId_tenantId: { userId: owner.id, tenantId: tenant.id } },
    update: {},
    create: { userId: owner.id, tenantId: tenant.id, role: Role.OWNER },
  });
  await prisma.membership.upsert({
    where: { userId_tenantId: { userId: demo.id, tenantId: tenant.id } },
    update: {},
    create: { userId: demo.id, tenantId: tenant.id, role: Role.MANAGER },
  });

  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        tenantId: tenant.id,
        name: 'Musterbank AG',
        shortName: 'MB',
        industry: 'Banking',
        vatId: 'DE987654321',
        contactName: 'Dr. Weber',
        contactEmail: 'weber@musterbank.de',
        addressStreet: 'Bankstrasse 5',
        addressZip: '60311',
        addressCity: 'Frankfurt',
        paymentTerms: 14,
      },
    }),
    prisma.customer.create({
      data: {
        tenantId: tenant.id,
        name: 'Startup Pioneers UG',
        shortName: 'SP',
        industry: 'SaaS',
        contactEmail: 'billing@startup-pioneers.io',
        paymentTerms: 30,
      },
    }),
    prisma.customer.create({
      data: {
        tenantId: tenant.id,
        name: 'Industrial GmbH',
        shortName: 'IND',
        industry: 'Fertigung',
        vatId: 'DE555444333',
        contactEmail: 'einkauf@industrial.de',
        addressStreet: 'Fabrikweg 22',
        addressZip: '80333',
        addressCity: 'Muenchen',
        paymentTerms: 21,
      },
    }),
  ]);

  const employees = await Promise.all([
    prisma.employee.create({
      data: {
        tenantId: tenant.id,
        firstName: 'Anna', lastName: 'Schmidt', email: 'anna@demo-beratung.de',
        experienceLevel: 'Senior', skills: ['React', 'TypeScript', 'AWS'],
        weeklyHours: 40, monthlyIncome: 7500, internalCostRate: 65,
      },
    }),
    prisma.employee.create({
      data: {
        tenantId: tenant.id, firstName: 'Ben', lastName: 'Mueller',
        email: 'ben@demo-beratung.de', experienceLevel: 'Mid',
        skills: ['Node.js', 'PostgreSQL'], weeklyHours: 40,
        monthlyIncome: 5500, internalCostRate: 48,
      },
    }),
    prisma.employee.create({
      data: {
        tenantId: tenant.id, firstName: 'Clara', lastName: 'Wagner',
        email: 'clara@demo-beratung.de', experienceLevel: 'Lead',
        skills: ['Architecture', 'Kubernetes', 'React'], weeklyHours: 40,
        monthlyIncome: 9000, internalCostRate: 75,
      },
    }),
  ]);

  const projects = await Promise.all([
    prisma.project.create({
      data: {
        tenantId: tenant.id, customerId: customers[0].id,
        name: 'Core-Banking-Modernisierung', code: 'MB-2026-01',
        billingMode: BillingMode.TIME_AND_MATERIAL, hourlyRate: 145,
        budgetHours: 600, startDate: new Date('2026-01-15'),
      },
    }),
    prisma.project.create({
      data: {
        tenantId: tenant.id, customerId: customers[1].id,
        name: 'MVP Sprint-Pack', code: 'SP-2026-02',
        billingMode: BillingMode.FIXED_PRICE, fixedPrice: 85000,
        startDate: new Date('2026-02-01'),
      },
    }),
    prisma.project.create({
      data: {
        tenantId: tenant.id, customerId: customers[2].id,
        name: 'IoT-Plattform Phase 2', code: 'IND-2026-03',
        billingMode: BillingMode.TIME_AND_MATERIAL, hourlyRate: 125,
        budgetHours: 400, startDate: new Date('2026-03-01'),
      },
    }),
  ]);

  const today = new Date();
  for (let d = 0; d < 20; d++) {
    const date = subDays(today, d);
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    await prisma.timeEntry.createMany({
      data: [
        { tenantId: tenant.id, employeeId: employees[0].id, customerId: customers[0].id, projectId: projects[0].id, date, hours: 8, billableHours: 7, isBillable: true, status: TimeEntryStatus.APPROVED, description: 'API-Migration' },
        { tenantId: tenant.id, employeeId: employees[1].id, customerId: customers[1].id, projectId: projects[1].id, date, hours: 8, billableHours: 8, isBillable: true, status: TimeEntryStatus.APPROVED, description: 'Frontend-Features' },
        { tenantId: tenant.id, employeeId: employees[2].id, customerId: customers[2].id, projectId: projects[2].id, date, hours: 6, billableHours: 5, isBillable: true, status: TimeEntryStatus.APPROVED, description: 'Architektur-Workshop' },
      ],
    });
  }

  const invoice = await prisma.invoice.create({
    data: {
      tenantId: tenant.id, customerId: customers[0].id,
      invoiceNo: '2026-0001', status: 'PAID',
      issueDate: subDays(today, 30), dueDate: subDays(today, 16),
      netAmount: 14500, vatAmount: 2755, grossAmount: 17255, paidAmount: 17255,
      paidAt: subDays(today, 10), currency: 'EUR', paymentTerms: 14,
      bankIban: tenant.iban, bankBic: tenant.bic,
      items: {
        create: [{
          tenantId: tenant.id, position: 1,
          description: 'Core-Banking-Modernisierung Maerz 2026',
          quantity: 100, unit: 'Std', unitPrice: 145,
          netAmount: 14500, vatRate: 19, vatAmount: 2755, vatCategory: 'S',
          projectId: projects[0].id,
          servicePeriodFrom: new Date('2026-03-01'),
          servicePeriodTo: new Date('2026-03-31'),
        }],
      },
    },
  });
  console.log('Beispiel-Rechnung:', invoice.invoiceNo);

  console.log('');
  console.log('=== Seed abgeschlossen ===');
  console.log('Admin:  admin@kapazito.de / Kapazito2026!');
  console.log('Demo:   demo@kapazito.de  / Demo2026!');
  console.log('Slug:   demo');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
