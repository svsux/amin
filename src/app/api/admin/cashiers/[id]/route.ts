// src/app/api/admin/cashiers/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import bcrypt from "bcrypt";

// --- ИСПРАВЛЕННАЯ ФУНКЦИЯ PATCH ---
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "Доступ запрещен" }, { status: 403 });
    }

    // ИЗМЕНЕНО: Получаем ID правильным способом
    const cashierId = params.id;
    const body = await req.json();
    const { email, password } = body;

    const updateData: { email?: string; passwordHash?: string } = {};

    if (email) {
      updateData.email = email;
    }

    if (password && password.trim().length > 0) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "Нет данных для обновления" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: cashierId, role: "CASHIER" },
      data: updateData,
    });

    return NextResponse.json({ message: "Данные кассира обновлены" });
  } catch (error: any) {
    console.error("Ошибка при обновлении кассира:", error);
    if (error.code === 'P2025') {
      return NextResponse.json({ message: "Кассир не найден." }, { status: 404 });
    }
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        return NextResponse.json({ message: "Пользователь с таким email уже существует." }, { status: 409 });
    }
    return NextResponse.json({ message: "Ошибка сервера при обновлении кассира" }, { status: 500 });
  }
}

// --- ИСПРАВЛЕННАЯ ФУНКЦИЯ DELETE ---
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "Доступ запрещен" }, { status: 403 });
    }

    // ИЗМЕНЕНО: Получаем ID правильным способом
    const cashierId = params.id;

    await prisma.user.delete({
      where: { id: cashierId },
    });

    return NextResponse.json({ message: "Кассир и все его связи успешно удалены" });
  } catch (error: any) {
    console.error("Ошибка при удалении кассира:", error);
    if (error.code === 'P2025') {
       return NextResponse.json({ message: "Кассир не найден." }, { status: 404 });
    }
    return NextResponse.json({ message: "Ошибка сервера при удалении кассира" }, { status: 500 });
  }
}
