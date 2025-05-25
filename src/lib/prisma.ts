import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // @ts-expect-error // global.prisma is not a standard property
  if (!global.prisma) {
    // @ts-expect-error // global.prisma is not a standard property
    global.prisma = new PrismaClient();
  }
  // @ts-expect-error // global.prisma is not a standard property
  prisma = global.prisma;
}

export default prisma;