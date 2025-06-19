import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "CASHIER") {
      return NextResponse.json({ message: "Доступ запрещен" }, { status: 403 });
    }

    // ИСПРАВЛЕНО: Ищем активную смену, чтобы точно знать магазин
    const activeShift = await prisma.shift.findFirst({
      where: { cashierId: session.user.id, closedAt: null },
    });

    // Если смена не открыта, товаров для продажи нет. Возвращаем пустой массив.
    if (!activeShift) {
      return NextResponse.json([]);
    }

    const storeProducts = await prisma.storeProduct.findMany({
      where: { storeId: activeShift.storeId }, // Берем ID магазина из активной смены
      include: {
        product: true,
      },
    });

    // Форматируем данные для кассового аппарата
    const formattedProducts = storeProducts.map((sp) => ({
      id: sp.product.id,
      name: sp.product.name,
      price: sp.product.salePrice,
      quantity: sp.product.quantity,
      imageUrl: sp.product.imageUrl,
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error("Ошибка при получении списка товаров:", error);
    return NextResponse.json({ message: "Ошибка сервера." }, { status: 500 });
  }
}