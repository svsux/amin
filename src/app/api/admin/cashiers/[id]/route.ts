import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import bcrypt from "bcryptjs";

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params; // Извлечение параметров
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "Доступ запрещен" }, { status: 403 });
    }

    // Проверяем, существует ли пользователь с ролью CASHIER
    const cashier = await prisma.user.findUnique({
      where: { id },
    });

    if (!cashier || cashier.role !== "CASHIER") {
      return NextResponse.json({ message: "Кассир не найден" }, { status: 404 });
    }

    // Удаляем кассира
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Кассир успешно удалён" });
  } catch (error) {
    console.error("Ошибка при удалении кассира:", error);
    return NextResponse.json({ message: "Ошибка сервера" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> } // Исправлено: params теперь Promise
) {
  try {
    const { id } = await context.params; // Асинхронное извлечение параметров
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "Доступ запрещен" }, { status: 403 });
    }

    const body = await request.json();
    const { email, password } = body;

    const updatedData: { email?: string; passwordHash?: string } = {};
    if (email) updatedData.email = email;
    if (password) updatedData.passwordHash = await bcrypt.hash(password, 10);

    const cashier = await prisma.cashier.update({
      where: { id },
      data: updatedData,
    });

    return NextResponse.json({ cashier });
  } catch (error) {
    console.error("Ошибка при обновлении кассира:", error);
    return NextResponse.json({ message: "Ошибка сервера" }, { status: 500 });
  }
}