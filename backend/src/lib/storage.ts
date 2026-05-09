import https from 'node:https';

import { Client } from 'minio';

import { env } from '../config/env';

function parseEndpoint(value: string) {
  const parsed = new URL(value);

  return {
    endPoint: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : parsed.protocol === 'https:' ? 443 : 80,
    useSSL: parsed.protocol === 'https:',
  };
}

function createMinioClient() {
  if (
    !env.MINIO_ENDPOINT ||
    !env.MINIO_ACCESS_KEY ||
    !env.MINIO_SECRET_KEY ||
    !env.MINIO_BUCKET ||
    !env.MINIO_PUBLIC_URL
  ) {
    throw new Error('MinIO is not configured');
  }

  const endpoint = parseEndpoint(env.MINIO_ENDPOINT);

  return new Client({
    ...endpoint,
    accessKey: env.MINIO_ACCESS_KEY,
    secretKey: env.MINIO_SECRET_KEY,
    ...(endpoint.useSSL && !env.MINIO_SSL_VERIFY
      ? {
          transportAgent: new https.Agent({ rejectUnauthorized: false }),
        }
      : {}),
  });
}

let minioClient: Client | null = null;

function getMinioClient() {
  if (!minioClient) {
    minioClient = createMinioClient();
  }

  return minioClient;
}

function getFileExtension(file: File) {
  const normalizedName = file.name.toLowerCase();

  if (normalizedName.endsWith('.jpg') || normalizedName.endsWith('.jpeg')) return '.jpg';
  if (normalizedName.endsWith('.png')) return '.png';
  if (normalizedName.endsWith('.webp')) return '.webp';
  if (normalizedName.endsWith('.gif')) return '.gif';
  if (normalizedName.endsWith('.avif')) return '.avif';
  if (normalizedName.endsWith('.pdf')) return '.pdf';
  if (normalizedName.endsWith('.doc')) return '.doc';
  if (normalizedName.endsWith('.docx')) return '.docx';
  if (normalizedName.endsWith('.zip')) return '.zip';
  if (normalizedName.endsWith('.rar')) return '.rar';

  const mimeMap: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/avif': '.avif',
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/zip': '.zip',
    'application/vnd.rar': '.rar',
  };

  return mimeMap[file.type] ?? '.bin';
}

function encodeObjectPath(objectName: string) {
  return objectName
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

export function buildPublicObjectUrl(objectName: string) {
  const baseUrl = env.MINIO_PUBLIC_URL.replace(/\/$/, '');
  const bucket = encodeURIComponent(env.MINIO_BUCKET);

  return `${baseUrl}/${bucket}/${encodeObjectPath(objectName)}`;
}

export async function uploadEventBanner(file: File) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed');
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const objectName = `events/banners/${crypto.randomUUID()}${getFileExtension(file)}`;

  await getMinioClient().putObject(env.MINIO_BUCKET, objectName, buffer, buffer.length, {
    'Content-Type': file.type,
  });

  return {
    objectName,
    imageUrl: buildPublicObjectUrl(objectName),
  };
}

export async function uploadPaymentProof(file: File) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed for payment proof');
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const objectName = `events/payment-proofs/${crypto.randomUUID()}${getFileExtension(file)}`;

  await getMinioClient().putObject(env.MINIO_BUCKET, objectName, buffer, buffer.length, {
    'Content-Type': file.type,
  });

  return {
    objectName,
    imageUrl: buildPublicObjectUrl(objectName),
  };
}

export async function uploadProfilePhoto(file: File) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed for profile photo');
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const objectName = `users/profile-photos/${crypto.randomUUID()}${getFileExtension(file)}`;

  await getMinioClient().putObject(env.MINIO_BUCKET, objectName, buffer, buffer.length, {
    'Content-Type': file.type,
  });

  return {
    objectName,
    imageUrl: buildPublicObjectUrl(objectName),
  };
}

export async function uploadEventDocument(file: File) {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip',
    'application/vnd.rar',
  ];

  if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|zip|rar)$/i)) {
    throw new Error('Invalid document format. Allowed: PDF, DOC, DOCX, ZIP, RAR');
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const objectName = `events/materials/${crypto.randomUUID()}${getFileExtension(file)}`;

  await getMinioClient().putObject(env.MINIO_BUCKET, objectName, buffer, buffer.length, {
    'Content-Type': file.type || 'application/octet-stream',
  });

  return {
    objectName,
    fileUrl: buildPublicObjectUrl(objectName),
  };
}