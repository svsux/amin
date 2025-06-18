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

    // 1. Проверяем, есть ли уже открытая смена у этого кассира
    const existingOpenShift = await prisma.shift.findFirst({
      where: { cashierId, closedAt: null },
    });

    if (existingOpenShift) {
      return NextResponse.json(
        { message: "Смена уже открыта." },
        { status: 409 }
      );
    }

    // 2. Находим магазин, к которому привязан кассир
    const storeCashierLink = await prisma.storeCashier.findFirst({
      where: { cashierId },
    });

    if (!storeCashierLink) {
      return NextResponse.json(
        { message: "Кассир не привязан ни к одному магазину." },
        { status: 404 }
      );
    }

    // 3. Создаем новую смену
    const newShift = await prisma.shift.create({
      data: {
        cashierId: cashierId,
        storeId: storeCashierLink.storeId,
      },
    });

    return NextResponse.json({ message: "Смена успешно открыта.", shiftId: newShift.id });
  } catch (error) {
    console.error("Ошибка при открытии смены:", error);
    return NextResponse.json({ message: "Ошибка сервера." }, { status: 500 });
  }
}