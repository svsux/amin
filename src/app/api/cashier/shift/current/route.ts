import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "CASHIER") {
      return NextResponse.json({ message: "Доступ запрещен" }, { status: 403 });
    }

    const currentShift = await prisma.shift.findFirst({
      where: {
        cashierId: session.user.id,
        closedAt: null, // Ищем активную смену
      },
      // --- КЛЮЧЕВОЕ ИЗМЕНЕНИЕ ---
      // Включаем в ответ данные о магазине и кассире (пользователе)
      include: {
        store: true, // Добавляем объект магазина
        cashier: {   // Добавляем объект кассира
          select: {
            name: true,
            email: true,
          }
        }
      },
    });

    // Если активная смена не найдена, это не ошибка. Просто возвращаем null.
    if (!currentShift) {
      return NextResponse.json({ shift: null });
    }

    return NextResponse.json({ shift: currentShift });

  } catch (error) {
    console.error("Ошибка при получении текущей смены:", error);
    return NextResponse.json({ message: "Ошибка сервера" }, { status: 500 });
  }
}