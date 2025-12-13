import { PrismaClient } from "@prisma/client";
import { prisma } from "../utils/prisma";

export function getPrismaClient() {
  return prisma;
}

export async function disposePrisma() {
  await prisma.$disconnect();
}

export type PrismaClientType = PrismaClient;
