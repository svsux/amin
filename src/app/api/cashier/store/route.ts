import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 1. Проверяем авторизацию и роль
    if (!session?.user?.id || session.user.role !== "CASHIER") {
      return NextResponse.json({ message: "Доступ запрещен" }, { status: 403 });
    }

    // 2. Ищем ВСЕ связи кассира с магазинами
    const storeLinks = await prisma.storeCashier.findMany({
      where: {
        cashierId: session.user.id,
      },
      // Включаем полную информацию о магазине в результат
      include: {
        store: true,
      },
    });

    // 3. Создаем чистый массив магазинов из найденных связей
    const stores = storeLinks.map((link) => link.store);

    // 4. Всегда возвращаем успешный ответ со списком магазинов.
    // Если список будет пуст, страница входа обработает это корректно.
    return NextResponse.json({ stores });
  } catch (error) {
    console.error("Ошибка при получении магазинов кассира:", error);
    return NextResponse.json(
      { message: "Ошибка сервера при получении магазинов кассира" },
      { status: 500 }
    );
  }
}