import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "CASHIER") {
      return NextResponse.json({ message: "Доступ запрещен." }, { status: 403 });
    }

    const { storeId } = await req.json();
    if (!storeId) {
        return NextResponse.json({ message: "Необходимо указать ID магазина." }, { status: 400 });
    }

    const cashierId = session.user.id;

    const existingOpenShift = await prisma.shift.findFirst({
      where: { cashierId, closedAt: null }, // ИСПРАВЛЕНО: Используем 'closedAt'
    });

    if (existingOpenShift) {
      return NextResponse.json({ message: "Смена уже открыта." }, { status: 409 });
    }

    // ИСПРАВЛЕНО: Используем более надежный метод findFirst для проверки связи
    const storeCashierLink = await prisma.storeCashier.findFirst({
        where: { storeId: storeId, cashierId: cashierId },
    });

    if (!storeCashierLink) {
        return NextResponse.json({ message: "Вы не привязаны к этому магазину." }, { status: 403 });
    }

    const newShift = await prisma.shift.create({
      data: {
        cashierId: cashierId,
        storeId: storeId,
        openedAt: new Date(), // ИСПРАВЛЕНО: Используем 'openedAt'
      },
      include: {
        store: true,
      }
    });

    return NextResponse.json({ message: "Смена успешно открыта.", shift: newShift });
  } catch (error) {
    console.error("Ошибка при открытии смены:", error);
    return NextResponse.json({ message: "Ошибка сервера." }, { status: 500 });
  }
}