import { PrismaClient } from "../vendor/prisma.js";

let prisma: PrismaClient | null = null;

function ensureClient() {
  if (!process.env.DATABASE_URL) return null;
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

export function getPrismaClient() {
  return ensureClient();
}

export async function disposePrisma() {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}

export type PrismaClientType = PrismaClient;
