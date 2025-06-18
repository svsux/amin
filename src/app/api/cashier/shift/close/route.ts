import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "CASHIER") {
      return NextResponse.json({ message: "Доступ запрещен." }, { status: 403 });
    }

    const cashierId = session.user.id;

    const openShift = await prisma.shift.findFirst({
      where: { cashierId, closedAt: null },
      include: {
        transactions: {
          include: {
            items: {
              include: {
                product: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
    });

    if (!openShift) {
      return NextResponse.json({ message: "Нет открытой смены для закрытия." }, { status: 404 });
    }

    // Собираем данные для отчета
    let totalSales = 0;
    let totalCardSales = 0;
    let totalQrSales = 0; // 'qr' используется для наличных
    const soldProductsMap = new Map<string, { name: string; quantity: number }>();

    for (const tx of openShift.transactions) {
      totalSales += tx.total;
      if (tx.paymentMethod === 'card') {
        totalCardSales += tx.total;
      } else if (tx.paymentMethod === 'qr') {
        totalQrSales += tx.total;
      }

      for (const item of tx.items) {
        const existingProduct = soldProductsMap.get(item.productId);
        if (existingProduct) {
          existingProduct.quantity += item.quantity;
        } else {
          soldProductsMap.set(item.productId, {
            name: item.product.name,
            quantity: item.quantity,
          });
        }
      }
    }

    const transactionCount = openShift.transactions.length;
    const soldProducts = Array.from(soldProductsMap.values());
    const closedAt = new Date();

    // Закрываем смену
    await prisma.shift.update({
      where: { id: openShift.id },
      data: { closedAt },
    });

    // Возвращаем расширенный отчет
    return NextResponse.json({
      message: "Смена успешно закрыта.",
      report: {
        totalSales,
        totalCardSales,
        totalQrSales,
        transactionCount,
        soldProducts,
        openedAt: openShift.openedAt.toISOString(),
        closedAt: closedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Ошибка при закрытии смены:", error);
    return NextResponse.json({ message: "Ошибка сервера." }, { status: 500 });
  }
}