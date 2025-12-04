import { PrismaClient } from "../vendor/prisma.js";

let prisma: PrismaClient | null = null;

export function getPrismaClient() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (!prisma) {
    prisma = new PrismaClient();
  }

  return prisma;
}

export async function disposePrisma() {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}
