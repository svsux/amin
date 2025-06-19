import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "Доступ запрещен" }, { status: 403 });
    }

    const productId = params.id;
    const { storeIds } = await req.json();

    if (!Array.isArray(storeIds)) {
      return NextResponse.json({ message: "Неверный формат данных: storeIds должен быть массивом." }, { status: 400 });
    }

    // Используем транзакцию для целостности данных
    await prisma.$transaction(async (tx) => {
      // 1. Удаляем все существующие связи для этого товара
      await tx.storeProduct.deleteMany({
        where: {
          productId: productId,
        },
      });

      // 2. Создаем новые связи, если ID магазинов были предоставлены
      if (storeIds.length > 0) {
        await tx.storeProduct.createMany({
          data: storeIds.map((storeId: string) => ({
            productId: productId,
            storeId: storeId,
          })),
        });
      }
    });

    return NextResponse.json({ message: "Связи товара с магазинами обновлены." }, { status: 200 });

  } catch (error: any) {
    console.error("Ошибка при обновлении связей товара с магазинами:", error);
    if (error.code === 'P2003') {
        return NextResponse.json({ message: "Один или несколько указанных магазинов не существуют." }, { status: 404 });
    }
    return NextResponse.json({ message: "Ошибка сервера", details: error.message }, { status: 500 });
  }
}