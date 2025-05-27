import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
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
  } catch (error) {
    console.error("Ошибка при получении списка магазинов:", error);
    return NextResponse.json({ message: "Ошибка сервера" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "Доступ запрещен" }, { status: 403 });
    }

    const { name, address, cashierIds } = await req.json();

    // Проверка обязательных данных
    if (!name || !address) {
      return NextResponse.json(
        { message: "Поля name и address обязательны." },
        { status: 400 }
      );
    }

    const store = await prisma.store.create({
      data: {
        name,
        address,
        cashiers: {
          create: cashierIds?.map((cashierId: string) => ({ cashierId })) || [],
        },
      },
      include: {
        cashiers: { include: { cashier: true } },
        products: { include: { product: true } },
      },
    });

    return NextResponse.json({ store });
  } catch (error) {
    console.error("Ошибка при создании магазина:", error);
    return NextResponse.json({ message: "Ошибка сервера" }, { status: 500 });
  }
}