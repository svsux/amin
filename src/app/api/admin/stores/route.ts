import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ message: "Доступ запрещен" }, { status: 403 });
  }
  const stores = await prisma.store.findMany({
    include: {
      cashiers: { include: { cashier: true } },
      products: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ stores });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ message: "Доступ запрещен" }, { status: 403 });
  }
  const { name, address, cashierIds } = await req.json();

  const store = await prisma.store.create({
    data: {
      name,
      address,
      cashiers: {
        create: cashierIds.map((cashierId: string) => ({ cashierId })),
      },
    },
    include: {
      cashiers: { include: { cashier: true } },
      products: { include: { product: true } },
    },
  });

  return NextResponse.json({ store });
}