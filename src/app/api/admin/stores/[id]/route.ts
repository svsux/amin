import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prismaClient from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "Доступ запрещен" }, { status: 403 });
    }

    const storeId = params.id;
    if (!storeId) {
      return NextResponse.json({ message: "ID магазина не указан" }, { status: 400 });
    }

    // Указываем тип tx как any
    await prismaClient.$transaction(async (tx: any) => {
      await tx.storeCashier.deleteMany({
        where: { storeId: storeId },
      });
      await tx.storeProduct.deleteMany({
        where: { storeId: storeId },
      });
      await tx.store.delete({
        where: { id: storeId },
      });
    });

    return NextResponse.json({ message: "Магазин и все связанные данные успешно удалены" }, { status: 200 });

  } catch (error: any) {
    console.error("Ошибка при удалении магазина:", error);
    if (error?.code === "P2025") {
      return NextResponse.json({ message: "Магазин не найден или уже удален" }, { status: 404 });
    }
    return NextResponse.json({ message: "Ошибка сервера при удалении магазина", details: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Доступ запрещен" }, { status: 403 });
    }

    const storeId = params.id;
    const body = await req.json();
    const { name, address } = body;

    const storeUpdateData: { name?: string; address?: string } = {};
    if (name !== undefined) storeUpdateData.name = name;
    if (address !== undefined) storeUpdateData.address = address;

    if (Object.keys(storeUpdateData).length === 0) {
        return NextResponse.json({ message: "Нет данных для обновления." }, { status: 400 });
    }

    const updatedStore = await prismaClient.store.update({
        where: { id: storeId },
        data: storeUpdateData,
    });

    return NextResponse.json({ store: updatedStore });

  } catch (error: any) {
    console.error("Ошибка при обновлении данных магазина:", error);
    if (error?.code === "P2025") {
      return NextResponse.json({ message: "Магазин не найден." }, { status: 404 });
    }
    return NextResponse.json({ message: "Ошибка сервера", details: error.message }, { status: 500 });
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
      },
    });

    return NextResponse.json({ store: newStore }, { status: 201 });

  } catch (error: any) {
    console.error("Ошибка при создании магазина:", error);
    return NextResponse.json({ message: "Ошибка сервера при создании магазина", details: error.message }, { status: 500 });
  }
}