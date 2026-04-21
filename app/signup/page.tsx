import { SignupClient } from './_signup-client';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Kapazito registrieren — 14 Tage kostenlos testen',
  description: 'Starte in 60 Sekunden mit Kapazito. Ohne Kreditkarte.',
};

export default function SignupPage() {
  return <SignupClient />;
}
