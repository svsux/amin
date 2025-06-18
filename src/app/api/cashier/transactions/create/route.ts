import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "CASHIER") {
    return NextResponse.json({ message: "Доступ запрещен." }, { status: 403 });
  }

  const cashierId = session.user.id;
  const body = await request.json();
  const { products, total, paymentMethod } = body;

  if (!products || !Array.isArray(products) || products.length === 0 || !total || !paymentMethod) {
    return NextResponse.json({ message: "Некорректные данные запроса." }, { status: 400 });
  }

  const openShift = await prisma.shift.findFirst({
    where: { cashierId, closedAt: null },
  });

  if (!openShift) {
    return NextResponse.json({ message: "Нет открытой смены для транзакции." }, { status: 403 });
  }

  try {
    // Используем транзакцию Prisma для обеспечения целостности данных
    const transactionResult = await prisma.$transaction(async (tx) => {
      // 1. Проверяем наличие всех товаров на складе перед продажей
      for (const item of products) {
        const productInDb = await tx.product.findUnique({
          where: { id: item.id },
        });

        if (!productInDb || productInDb.quantity < item.quantity) {
          throw new Error(`Недостаточно товара на складе для: ${productInDb?.name || item.id}`);
        }
      }

      // 2. Создаем запись о транзакции
      const newTransaction = await tx.transaction.create({
        data: {
          shiftId: openShift.id,
          total,
          paymentMethod,
          items: {
            create: products.map((product: { id: string; quantity: number; price: number }) => ({
              productId: product.id,
              quantity: product.quantity,
              priceAtSale: product.price,
            })),
          },
        },
      });

      // 3. Уменьшаем количество каждого проданного товара на складе
      for (const item of products) {
        await tx.product.update({
          where: { id: item.id },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newTransaction;
    });

    return NextResponse.json({
      message: "Транзакция успешно завершена.",
      transactionId: transactionResult.id,
    });
  } catch (error) {
    // Если произошла ошибка (например, нехватка товара), транзакция автоматически отменяется
    console.error("Ошибка транзакции:", error);
    const errorMessage = error instanceof Error ? error.message : "Ошибка сервера при обработке транзакции.";

    // Отправляем клиенту конкретную ошибку, если она связана с нехваткой товара
    if (errorMessage.startsWith("Недостаточно товара")) {
      return NextResponse.json({ message: errorMessage }, { status: 409 }); // 409 Conflict
    }

    return NextResponse.json({ message: "Ошибка сервера." }, { status: 500 });
  }
}