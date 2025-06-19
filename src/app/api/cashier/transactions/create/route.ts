import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "CASHIER") {
    return NextResponse.json({ message: "Доступ запрещен." }, { status: 403 });
  }

  const openShift = await prisma.shift.findFirst({
    where: { cashierId: session.user.id, closedAt: null },
  });

  if (!openShift) {
    return NextResponse.json({ message: "Смена не открыта. Продажа невозможна." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { products, total, paymentMethod } = body;

    if (!products || !Array.isArray(products) || products.length === 0 || !total || !paymentMethod) {
      return NextResponse.json({ message: "Некорректные данные для транзакции." }, { status: 400 });
    }

    const transactionResult = await prisma.$transaction(async (tx) => {
      for (const item of products) {
        const updatedProduct = await tx.product.update({
          where: { id: item.id },
          data: { quantity: { decrement: item.quantity } },
        });
        if (updatedProduct.quantity < 0) {
          throw new Error(`Недостаточно товара на складе для: ${updatedProduct.name}`);
        }
      }

      const newTransaction = await tx.transaction.create({
        data: {
          shiftId: openShift.id,
          total,
          paymentMethod,
        },
      });

      // ИСПРАВЛЕНО: Используем 'priceAtSale' вместо 'price'
      await tx.transactionItem.createMany({
        data: products.map((p: { id: string; quantity: number; price: number }) => ({
          transactionId: newTransaction.id,
          productId: p.id,
          quantity: p.quantity,
          priceAtSale: p.price, // <--- КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ
        })),
      });

      return newTransaction;
    });

    return NextResponse.json({
      message: "Оплата прошла успешно!",
      transactionId: transactionResult.id,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Ошибка сервера при обработке транзакции.";
    console.error("Ошибка транзакции:", error);
    return NextResponse.json({ message: errorMessage }, { status: 409 });
  }
}