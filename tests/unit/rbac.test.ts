import { describe, it, expect } from 'vitest';
import { can } from '@/lib/rbac';
import { Role } from '@prisma/client';

describe('RBAC', () => {
  it('OWNER darf alles', () => {
    expect(can(Role.OWNER, 'invoice:send')).toBe(true);
    expect(can(Role.OWNER, 'tenant:update')).toBe(true);
  });
  it('MEMBER darf nur eigene Zeiten schreiben, keine Rechnungen senden', () => {
    expect(can(Role.MEMBER, 'time:write:own')).toBe(true);
    expect(can(Role.MEMBER, 'invoice:send')).toBe(false);
  });
  it('FINANCE darf Rechnungen managen und approven', () => {
    expect(can(Role.FINANCE, 'invoice:send')).toBe(true);
    expect(can(Role.FINANCE, 'agent:approve')).toBe(true);
  });
  it('GUEST ist read-only', () => {
    expect(can(Role.GUEST, 'invoice:read')).toBe(false);
    expect(can(Role.GUEST, 'customer:read')).toBe(true);
  });
});
