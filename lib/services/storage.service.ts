// Storage-Abstraktion.
// Default: lokales Volume unter /app/storage (im Container gemountet).
// Alternativ: S3 / R2 (geht spaeter einsteckbar — Interface ist gleich).

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.env.STORAGE_ROOT ?? path.join(process.cwd(), 'storage');

export interface StoredFile {
  key: string;
  size: number;
  mimeType: string;
}

async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true });
}

function keyFor(tenantId: string, kind: string, id: string, ext: string): string {
  return path.posix.join(tenantId, kind, `${id}.${ext}`);
}

export async function putFile(params: {
  tenantId: string;
  kind: 'invoice-pdf' | 'invoice-xml' | 'upload' | 'logo' | 'attachment';
  id?: string;
  ext: string;
  mimeType: string;
  data: Buffer | string;
}): Promise<StoredFile> {
  const id = params.id ?? crypto.randomUUID();
  const key = keyFor(params.tenantId, params.kind, id, params.ext);
  const abs = path.join(ROOT, key);
  await ensureDir(path.dirname(abs));
  const buf = typeof params.data === 'string' ? Buffer.from(params.data, 'utf-8') : params.data;
  await fs.writeFile(abs, buf);
  return { key, size: buf.length, mimeType: params.mimeType };
}

export async function getFile(key: string, tenantId: string): Promise<Buffer> {
  if (!key.startsWith(tenantId + '/')) {
    throw new Error('Zugriff verweigert — Key gehoert nicht zum Tenant.');
  }
  const abs = path.join(ROOT, key);
  return fs.readFile(abs);
}

export async function deleteFile(key: string, tenantId: string): Promise<void> {
  if (!key.startsWith(tenantId + '/')) {
    throw new Error('Zugriff verweigert — Key gehoert nicht zum Tenant.');
  }
  const abs = path.join(ROOT, key);
  await fs.unlink(abs).catch(() => {});
}

export function localPathFor(key: string): string {
  return path.join(ROOT, key);
}
