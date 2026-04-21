// Signup-Service.
// Erzeugt atomar: Tenant + Owner-User + Membership. Trial laeuft 14 Tage.
//
// Slug wird aus Firmenname generiert und auf Eindeutigkeit geprueft
// (mit numerischem Suffix -2, -3 bei Kollision).
//
// Passwort-Policy: min 10 Zeichen, 1 Zahl, 1 Buchstabe.
// Bei zu schwachen Passwoertern: ValidationError.

import { prisma } from '@/lib/db';
import { Plan, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { addDays } from 'date-fns';
import { sendMail } from './email.service';
import { logger } from '@/lib/errors';

export interface SignupInput {
  email: string;
  password: string;
  name: string;
  companyName: string;
  companyLegalName?: string;
  vatId?: string;
  addressStreet?: string;
  addressZip?: string;
  addressCity?: string;
  addressCountry?: string;
}

export interface SignupResult {
  tenantId: string;
  tenantSlug: string;
  userId: string;
  email: string;
}

const TRIAL_DAYS = 14;

export async function signupTenantOwner(input: SignupInput): Promise<SignupResult> {
  validatePassword(input.password);
  validateEmail(input.email);
  if (!input.companyName?.trim()) throw new ValidationError('Firmenname ist Pflicht.');
  if (!input.name?.trim()) throw new ValidationError('Dein Name ist Pflicht.');

  const email = input.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });

  const hashedPwd = await bcrypt.hash(input.password, 12);
  const slug = await generateUniqueSlug(input.companyName);

  const result = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        slug,
        name: input.companyName.trim(),
        legalName: input.companyLegalName?.trim() || input.companyName.trim(),
        vatId: input.vatId?.trim(),
        addressStreet: input.addressStreet?.trim(),
        addressZip: input.addressZip?.trim(),
        addressCity: input.addressCity?.trim(),
        addressCountry: (input.addressCountry ?? 'DE').toUpperCase(),
        plan: Plan.TRIAL,
        trialEndsAt: addDays(new Date(), TRIAL_DAYS),
      },
    });

    const user = existing
      ? await tx.user.update({ where: { id: existing.id }, data: { name: existing.name ?? input.name } })
      : await tx.user.create({
          data: {
            email,
            password: hashedPwd,
            name: input.name.trim(),
          },
        });

    await tx.membership.create({
      data: {
        userId: user.id,
        tenantId: tenant.id,
        role: Role.OWNER,
      },
    });

    return { tenantId: tenant.id, tenantSlug: tenant.slug, userId: user.id, email: user.email };
  });

  // Welcome-Mail (bricht Signup nicht ab, falls Mail fehlschlaegt)
  try {
    await sendMail({
      to: result.email,
      subject: `Willkommen bei Kapazito, ${input.name}!`,
      body: renderWelcomeEmail(input.name, result.tenantSlug),
    });
  } catch (e: any) {
    logger.warn({ err: e, email: result.email }, 'Welcome-Mail fehlgeschlagen');
  }

  logger.info({ tenantId: result.tenantId, slug: result.tenantSlug }, 'Tenant angelegt');
  return result;
}

// --------------------- Helpers ---------------------

function validatePassword(pw: string): void {
  if (!pw || pw.length < 10) throw new ValidationError('Passwort muss mindestens 10 Zeichen haben.');
  if (!/[A-Za-z]/.test(pw)) throw new ValidationError('Passwort braucht mindestens einen Buchstaben.');
  if (!/\d/.test(pw)) throw new ValidationError('Passwort braucht mindestens eine Zahl.');
}

function validateEmail(email: string): void {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ValidationError('Ungueltige E-Mail-Adresse.');
  }
}

async function generateUniqueSlug(companyName: string): Promise<string> {
  const base = slugify(companyName);
  if (!base) throw new ValidationError('Firmenname ergibt keinen gueltigen Slug.');

  let candidate = base;
  let n = 2;
  while (await prisma.tenant.findUnique({ where: { slug: candidate } })) {
    candidate = `${base}-${n}`;
    n++;
    if (n > 100) throw new Error('Slug-Generierung ueberschritten');
  }
  return candidate;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

function renderWelcomeEmail(name: string, slug: string): string {
  const url = `${process.env.NEXTAUTH_URL ?? 'https://app.kapazito.de'}/login`;
  return `Hallo ${name},

willkommen bei Kapazito. Dein Mandant wurde angelegt — die naechsten 14 Tage sind Trial-Zeitraum.

Deine Organisation: ${slug}
Login: ${url}

Was jetzt ansteht (5 Minuten):
  1. Firmendaten vervollstaendigen (Bankdaten fuer Rechnungen).
  2. Ersten Mitarbeiter und ersten Kunden anlegen.
  3. Erstes Projekt definieren — dann kannst du Zeiten erfassen und abrechnen.

Kapi, unser Assistent, begleitet dich. Sag ihm einfach "hilf mir anzufangen".

Fragen? Antworte auf diese Mail.

Freundliche Gruesse
Das Kapazito-Team
`;
}

export class ValidationError extends Error {
  status = 400;
}
