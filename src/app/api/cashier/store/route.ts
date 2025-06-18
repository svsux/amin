import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "CASHIER") {
      return NextResponse.json({ message: "Доступ запрещен." }, { status: 403 });
    }

    const cashierId = session.user.id;

    // Находим магазин, к которому привязан кассир
    const store = await prisma.store.findFirst({
      where: {
        cashiers: {
          // ИСПРАВЛЕНИЕ ЗДЕСЬ:
          // Ищем по полю cashierId в таблице-связке, а не по id самой связки
          some: { cashierId: cashierId },
        },
      },
    });

    if (!store) {
      // Эта строка и вызывала ошибку 404, так как магазин не находился
      return NextResponse.json({ message: "Магазин не найден для данного кассира." }, { status: 404 });
    }

    // Возвращаем информацию о магазине и кассире
    return NextResponse.json({
      store: {
        id: store.id,
        name: store.name,
        address: store.address,
      },
      cashier: {
        name: session.user.name,   // Имя из сессии
        email: session.user.email, // Email из сессии
      },
    });

  } catch (error) {
    console.error("Ошибка при получении информации о магазине:", error);
    return NextResponse.json({ message: "Ошибка сервера." }, { status: 500 });
  }
}