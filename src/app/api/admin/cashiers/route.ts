import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

// ДОБАВЬТЕ ЭТУ СТРОКУ
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cashiers = await prisma.user.findMany({
      where: { role: "CASHIER" },
      orderBy: { createdAt: "desc" },
      include: {
        // ИСПРАВЛЕНО: Включаем промежуточную таблицу 'storeCashiers'
        storeCashiers: true,
      },
    });
    return NextResponse.json(cashiers);
  } catch (error) {
    console.error("Ошибка при получении кассиров:", error);
    return NextResponse.json({ message: "Ошибка сервера" }, { status: 500 });
  }
}