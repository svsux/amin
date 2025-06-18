import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    if (!startDateParam || !endDateParam) {
      return NextResponse.json({ message: "Необходимо указать начальную и конечную даты." }, { status: 400 });
    }

    const startDate = startOfDay(new Date(startDateParam));
    const endDate = endOfDay(new Date(endDateParam));

    const transactions = await prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        shift: {
          include: {
            store: true,
          },
        },
        // ИСПРАВЛЕНО: Используем правильное имя 'items' из schema.prisma
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (transactions.length === 0) {
      return NextResponse.json({
        kpi: { totalSales: 0, transactionCount: 0, averageCheck: 0, totalProductsSold: 0 },
        dailySales: [],
        salesByStore: [],
        topProducts: [],
      });
    }

    const totalSales = transactions.reduce((sum, t) => sum + t.total, 0);
    const transactionCount = transactions.length;
    const averageCheck = transactionCount > 0 ? totalSales / transactionCount : 0;
    // ИСПРАВЛЕНО: итерация по t.items
    const totalProductsSold = transactions.reduce((sum, t) => sum + t.items.reduce((pSum: number, p: { quantity: number }) => pSum + p.quantity, 0), 0);

    const dailySales: { [key: string]: number } = {};
    transactions.forEach(t => {
      const date = t.createdAt.toISOString().split('T')[0];
      if (!dailySales[date]) {
        dailySales[date] = 0;
      }
      dailySales[date] += t.total;
    });
    const dailySalesArray = Object.entries(dailySales).map(([date, total]) => ({ date, total })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const salesByStore: { [key: string]: { name: string; total: number } } = {};
    transactions.forEach(t => {
      if (t.shift && t.shift.store) {
        const storeId = t.shift.store.id;
        if (!salesByStore[storeId]) {
          salesByStore[storeId] = { name: t.shift.store.name, total: 0 };
        }
        salesByStore[storeId].total += t.total;
      }
    });
    const salesByStoreArray = Object.values(salesByStore);

    const productSales: { [key: string]: { name: string; quantity: number } } = {};
    transactions.forEach(t => {
      // ИСПРАВЛЕНО: итерация по t.items
      t.items.forEach(item => {
        if (item.product) {
          if (!productSales[item.productId]) {
            productSales[item.productId] = { name: item.product.name, quantity: 0 };
          }
          productSales[item.productId].quantity += item.quantity;
        }
      });
    });
    const topProductsArray = Object.values(productSales).sort((a, b) => b.quantity - a.quantity).slice(0, 5);

    return NextResponse.json({
      kpi: {
        totalSales,
        transactionCount,
        averageCheck,
        totalProductsSold,
      },
      dailySales: dailySalesArray,
      salesByStore: salesByStoreArray,
      topProducts: topProductsArray,
    });

  } catch (error) {
    console.error("Ошибка при получении статистики:", error);
    return NextResponse.json({ message: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}