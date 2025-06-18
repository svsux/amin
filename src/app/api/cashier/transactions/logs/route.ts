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

    // 1. Находим текущую открытую смену
    const openShift = await prisma.shift.findFirst({
      where: {
        cashierId: cashierId,
        closedAt: null, // Ищем только открытую смену
      },
    });

    // 2. Если открытой смены нет, возвращаем пустой массив
    if (!openShift) {
      return NextResponse.json([]);
    }

    // 3. Если смена есть, получаем транзакции только для этой смены
    const transactions = await prisma.transaction.findMany({
      where: {
        shiftId: openShift.id,
      },
      include: {
        items: {
          include: {
            product: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Форматируем ответ
    const formattedTransactions = transactions.map((transaction) => ({
      id: transaction.id,
      total: transaction.total,
      paymentMethod: transaction.paymentMethod,
      createdAt: transaction.createdAt,
      products: transaction.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
      })),
    }));

    return NextResponse.json(formattedTransactions);
  } catch (error) {
    console.error("Ошибка при получении логов транзакций:", error);
    return NextResponse.json({ message: "Ошибка сервера." }, { status: 500 });
  }
}