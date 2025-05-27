import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function DELETE(request: Request, context: any) {
  const { params } = context;
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ message: "Доступ запрещен" }, { status: 403 });
  }
  const { id } = params;
  await prisma.store.delete({ where: { id } });
  return NextResponse.json({ message: "Магазин удалён" });
}

export async function PATCH(request: Request, context: any) {
  const { params } = context;
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ message: "Доступ запрещен" }, { status: 403 });
  }
  const { id } = params;
  const { name, address, cashierIds, productIds } = await request.json();

  const store = await prisma.store.update({
    where: { id },
    data: {
      name,
      address,
      cashiers: {
        deleteMany: {},
        create: cashierIds.map((cashierId: string) => ({ cashierId })),
      },
      products: {
        deleteMany: {},
        create: productIds.map((productId: string) => ({ productId })),
      },
    },
    include: {
      cashiers: { include: { cashier: true } },
      products: { include: { product: true } },
    },
  });

  return NextResponse.json({ store });
}