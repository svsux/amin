import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "CASHIER") {
      return NextResponse.json({ message: "Доступ запрещен." }, { status: 403 });
    }

    const cashierId = session.user.id;

    const storeCashierLink = await prisma.storeCashier.findFirst({
      where: { cashierId },
    });

    if (!storeCashierLink) {
      return NextResponse.json(
        { message: "Кассир не привязан к магазину." },
        { status: 404 }
      );
    }

    const storeId = storeCashierLink.storeId;

    const storeProducts = await prisma.storeProduct.findMany({
      where: { storeId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            salePrice: true,
            quantity: true,
            imageUrl: true, // Добавляем URL изображения
          },
        },
      },
    });

    const formattedProducts = storeProducts.map((p) => ({
      id: p.product.id,
      name: p.product.name,
      price: p.product.salePrice,
      quantity: p.product.quantity,
      imageUrl: p.product.imageUrl, // Передаем URL изображения
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error("Ошибка при получении списка товаров:", error);
    return NextResponse.json({ message: "Ошибка сервера." }, { status: 500 });
  }
}