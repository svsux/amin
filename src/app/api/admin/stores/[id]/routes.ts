import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "Доступ запрещен" }, { status: 403 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ message: "ID магазина не указан" }, { status: 400 });
    }

    await prisma.store.delete({ where: { id } });
    return NextResponse.json({ message: "Магазин удалён" });
  } catch (error) {
    console.error("Ошибка при удалении магазина:", error);
    return NextResponse.json({ message: "Ошибка сервера" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "Доступ запрещен" }, { status: 403 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ message: "ID магазина не указан" }, { status: 400 });
    }

    const { name, address, cashierIds, productIds } = await request.json();

    // Проверка обязательных данных
    if (!name || !address) {
      return NextResponse.json(
        { message: "Поля name и address обязательны." },
        { status: 400 }
      );
    }

    const store = await prisma.store.update({
      where: { id },
      data: {
        name,
        address,
        cashiers: {
          deleteMany: {}, // Удаляем старые связи
          create: cashierIds?.map((cashierId: string) => ({ cashierId })) || [],
        },
        products: {
          deleteMany: {}, // Удаляем старые связи
          create: productIds?.map((productId: string) => ({ productId })) || [],
        },
      },
      include: {
        cashiers: { include: { cashier: true } },
        products: { include: { product: true } },
      },
    });

    return NextResponse.json({ store });
  } catch (error) {
    console.error("Ошибка при обновлении магазина:", error);
    return NextResponse.json({ message: "Ошибка сервера" }, { status: 500 });
  }
}