import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

// Отключаем кэширование
export const dynamic = 'force-dynamic';

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

    // Возвращаем массив, а не объект
    return NextResponse.json(stores);
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

    // Возвращаем объект с ключом store
    return NextResponse.json({ store }, { status: 201 });
  } catch (error) {
    console.error("Ошибка при создании магазина:", error);
    return NextResponse.json({ message: "Ошибка сервера" }, { status: 500 });
  }
}