import { PrismaClient, Prisma } from "@prisma/client";

const connectionInfo = () => {
  if (!process.env.DATABASE_URL) {
    console.warn("[Prisma] DATABASE_URL is missing");
    return;
  }
  try {
    const parsed = new URL(process.env.DATABASE_URL);
    console.log(
      `[Prisma] DATABASE_URL ok → host=${parsed.hostname}, port=${parsed.port || "default"}, db=${parsed.pathname}`
    );
  } catch {
    console.warn("[Prisma] DATABASE_URL is invalid");
  }
};

connectionInfo();

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : []
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export const logPrismaError = (label: string, error: unknown) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error(
      `[Prisma][${label}] ${error.code} ${error.message}`,
      { clientVersion: error.clientVersion, stack: error.stack }
    );
  } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    console.error(`[Prisma][${label}] Unknown error`, error);
  } else if (error instanceof Error) {
    console.error(`[Prisma][${label}] ${error.name}: ${error.message}`, error.stack);
  } else {
    console.error(`[Prisma][${label}]`, error);
  }
};
