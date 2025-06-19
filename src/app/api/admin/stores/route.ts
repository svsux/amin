import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prismaClient from "@/lib/prisma";

// Отключаем кэширование
export const dynamic = 'force-dynamic';

// ДОБАВЬТЕ ЭТУ ФУНКЦИЮ GET
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "Доступ запрещен" }, { status: 403 });
    }

    const stores = await prismaClient.store.findMany({
      include: {
        cashiers: {
          include: {
            cashier: true, // Включаем полную информацию о кассире
          },
        },
        products: {
          include: {
            product: true, // Включаем полную информацию о товаре
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ stores });
  } catch (error) {
    console.error("Ошибка при получении магазинов:", error);
    return NextResponse.json({ message: "Ошибка сервера при получении магазинов" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Доступ запрещен" }, { status: 403 });
    }

    const body = await req.json();
    const { name, address, cashierIds = [] } = body;

    if (!name || typeof name !== 'string' || name.trim() === "") {
      return NextResponse.json({ message: "Название магазина обязательно." }, { status: 400 });
    }

    if (cashierIds.length > 0) {
      const existingCashiersCount = await prismaClient.user.count({
        where: { id: { in: cashierIds }, role: 'CASHIER' },
      });
      if (existingCashiersCount !== cashierIds.length) {
        return NextResponse.json({ message: "Один или несколько выбранных кассиров не найдены." }, { status: 400 });
      }
    }

    const newStore = await prismaClient.store.create({
      data: {
        name,
        address,
        cashiers: {
          create: cashierIds.map((cashierId: string) => ({
            cashierId: cashierId,
            assignedBy: session.user!.email!,
          })),
        },
      },
      include: {
        cashiers: { include: { cashier: true } },
        products: { include: { product: true } },
      },
    });

    return NextResponse.json({ store: newStore }, { status: 201 });

  } catch (error: any) {
    console.error("Ошибка при создании магазина:", error);
    return NextResponse.json({ message: "Ошибка сервера при создании магазина", details: error.message }, { status: 500 });
  }
}