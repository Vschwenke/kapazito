// Role-Based Access Control — zentrale Permissions-Matrix.
// Kein Feature-Check darf dezentral stattfinden — immer hier abfragen.
import { Role } from '@prisma/client';

export type Permission =
  | 'tenant:read'
  | 'tenant:update'
  | 'user:invite'
  | 'user:remove'
  | 'customer:read'
  | 'customer:write'
  | 'employee:read'
  | 'employee:write'
  | 'project:read'
  | 'project:write'
  | 'time:read:own'
  | 'time:read:all'
  | 'time:write:own'
  | 'time:approve'
  | 'invoice:read'
  | 'invoice:write'
  | 'invoice:send'
  | 'invoice:delete'
  | 'finance:read'
  | 'finance:write'
  | 'bwa:import'
  | 'agent:use'
  | 'agent:approve'
  | 'apikey:manage'
  | 'audit:read';

const MATRIX: Record<Role, Permission[]> = {
  OWNER: ALL(),
  ADMIN: ALL_EXCEPT(['tenant:update']),
  FINANCE: [
    'tenant:read',
    'customer:read',
    'customer:write',
    'employee:read',
    'project:read',
    'time:read:all',
    'invoice:read',
    'invoice:write',
    'invoice:send',
    'invoice:delete',
    'finance:read',
    'finance:write',
    'bwa:import',
    'agent:use',
    'agent:approve',
    'audit:read',
  ],
  MANAGER: [
    'tenant:read',
    'customer:read',
    'customer:write',
    'employee:read',
    'project:read',
    'project:write',
    'time:read:all',
    'time:write:own',
    'time:approve',
    'invoice:read',
    'finance:read',
    'agent:use',
  ],
  MEMBER: [
    'tenant:read',
    'customer:read',
    'project:read',
    'time:read:own',
    'time:write:own',
    'agent:use',
  ],
  GUEST: ['tenant:read', 'customer:read', 'project:read', 'time:read:own'],
};

function ALL(): Permission[] {
  return [
    'tenant:read',
    'tenant:update',
    'user:invite',
    'user:remove',
    'customer:read',
    'customer:write',
    'employee:read',
    'employee:write',
    'project:read',
    'project:write',
    'time:read:own',
    'time:read:all',
    'time:write:own',
    'time:approve',
    'invoice:read',
    'invoice:write',
    'invoice:send',
    'invoice:delete',
    'finance:read',
    'finance:write',
    'bwa:import',
    'agent:use',
    'agent:approve',
    'apikey:manage',
    'audit:read',
  ];
}

function ALL_EXCEPT(remove: Permission[]): Permission[] {
  return ALL().filter((p) => !remove.includes(p));
}

export function can(role: Role, perm: Permission): boolean {
  return MATRIX[role]?.includes(perm) ?? false;
}

export function requirePermission(role: Role, perm: Permission): void {
  if (!can(role, perm)) {
    const err = new Error(`Recht ${perm} fehlt fuer Rolle ${role}`) as Error & { status: number };
    err.status = 403;
    throw err;
  }
}
