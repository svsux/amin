import { NextResponse, NextRequest } from "next/server";
import prismaClient from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function DELETE(
  request: NextRequest,
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

export async function PATCH(
  request: NextRequest,
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

    const body = await request.json();
    const { name, address, cashierIds, productIds } = body;

    if (name !== undefined && (typeof name !== 'string' || name.trim() === "")) {
      return NextResponse.json(
        { message: "Название магазина не может быть пустым." },
        { status: 400 }
      );
    }

    const dataToUpdate: Record<string, any> = {};

    if (name !== undefined) {
        dataToUpdate.name = name;
    }

    if (address !== undefined) {
      if (typeof address === 'string' && address.trim() !== "") {
        dataToUpdate.address = address;
      } else if (address === null || (typeof address === 'string' && address.trim() === "")) {
        console.warn(`Попытка установить пустой адрес для обязательного поля магазина ID: ${storeId}. Обновление адреса проигнорировано.`);
      }
    }

    if (cashierIds !== undefined && Array.isArray(cashierIds)) {
        dataToUpdate.cashiers = {
            deleteMany: {},
            create: cashierIds.map((cashierId: string) => ({
                cashier: { connect: { id: cashierId } }
            })),
        };
    }

    if (productIds !== undefined && Array.isArray(productIds)) {
        dataToUpdate.products = {
            deleteMany: {},
            create: productIds.map((productId: string) => ({
                product: { connect: { id: productId } }
            })),
        };
    }

    if (Object.keys(dataToUpdate).length === 0) {
        return NextResponse.json({ message: "Нет данных для обновления или предоставленные данные некорректны для обязательных полей." }, { status: 400 });
    }

    const store = await prismaClient.store.update({
      where: { id: storeId },
      data: dataToUpdate,
      include: {
        cashiers: { include: { cashier: true } },
        products: { include: { product: true } },
      },
    });

    return NextResponse.json({ store });
  } catch (error: any) {
    console.error("Ошибка при обновлении магазина:", error);
    if (error?.code === "P2025") {
      return NextResponse.json({ message: "Магазин для обновления не найден." }, { status: 404 });
    }
    return NextResponse.json({ message: "Ошибка сервера при обновлении магазина", details: error.message }, { status: 500 });
  }
}