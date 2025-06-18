import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "Доступ запрещен." }, { status: 403 });
    }

    // Получаем параметры даты из URL
    const { searchParams } = request.nextUrl;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Формируем условие для Prisma
    const whereClause: any = {
      closedAt: {
        not: null,
      },
    };

    if (startDate && endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999); // Включаем весь конечный день

      whereClause.closedAt = {
        gte: new Date(startDate),
        lte: endOfDay,
        not: null,
      };
    }

    const closedShifts = await prisma.shift.findMany({
      where: whereClause, // Используем сформированное условие
      include: {
        cashier: {
          select: { name: true },
        },
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
      orderBy: {
        closedAt: 'desc',
      },
    });

    const reports = closedShifts.map(shift => {
      let totalSales = 0;
      let totalCardSales = 0;
      let totalQrSales = 0;
      const soldProductsMap = new Map<string, { name: string; quantity: number }>();

      for (const tx of shift.transactions) {
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

      return {
        id: shift.id,
        cashierName: shift.cashier.name || 'Неизвестный кассир',
        openedAt: shift.openedAt.toISOString(),
        closedAt: shift.closedAt!.toISOString(),
        totalSales,
        totalCardSales,
        totalQrSales,
        transactionCount: shift.transactions.length,
        soldProducts: Array.from(soldProductsMap.values()),
      };
    });

    return NextResponse.json(reports);

  } catch (error) {
    console.error("Ошибка при получении отчетов по сменам:", error);
    return NextResponse.json({ message: "Ошибка сервера." }, { status: 500 });
  }
}