import { AcceptInviteClient } from './_accept-client';

export const dynamic = 'force-dynamic';

export default function AcceptInvitePage({ searchParams }: { searchParams: { token?: string } }) {
  return <AcceptInviteClient token={searchParams.token ?? ''} />;
}
