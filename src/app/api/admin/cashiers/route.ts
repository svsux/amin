import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";

// ЕДИНСТВЕННАЯ И ПРАВИЛЬНАЯ ФУНКЦИЯ GET
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "Доступ запрещен" }, { status: 403 });
    }

    const cashiers = await prisma.user.findMany({
      where: { role: "CASHIER" },
      include: {
        storeCashiers: {
          select: {
            storeId: true, // Это нужно для подсчета `storeCashiers.length` на фронте
          },
        },
      },
      orderBy: {
        email: "asc",
      },
    });

    return NextResponse.json({ cashiers });
  } catch (error) {
    console.error("Ошибка при получении кассиров:", error);
    return NextResponse.json({ message: "Ошибка сервера при получении кассиров" }, { status: 500 });
  }
}

// Здесь могут быть ваши другие функции, например PATCH или DELETE,
// если они были в этом файле. Главное, что GET теперь только один.