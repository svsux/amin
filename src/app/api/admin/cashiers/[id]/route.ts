// src/app/api/admin/cashiers/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import bcrypt from "bcrypt";

// Удаление кассира
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "Доступ запрещен" }, { status: 403 });
    }

    const cashier = await prisma.user.findUnique({ where: { id } });
    if (!cashier || cashier.role !== "CASHIER") {
      return NextResponse.json({ message: "Кассир не найден" }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: "Кассир успешно удалён" });
  } catch (error) {
    console.error("Ошибка при удалении кассира:", error);
    return NextResponse.json({ message: "Ошибка сервера" }, { status: 500 });
  }
}

// Обновление кассира
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "Доступ запрещен" }, { status: 403 });
    }

    const body = await request.json();
    const { email, password } = body;

    const updatedData: { email?: string; passwordHash?: string } = {};
    if (email) updatedData.email = email;
    if (password) updatedData.passwordHash = await bcrypt.hash(password, 10);

    const cashier = await prisma.user.findUnique({ where: { id } });
    if (!cashier || cashier.role !== "CASHIER") {
      return NextResponse.json({ message: "Кассир не найден" }, { status: 404 });
    }

    const updatedCashier = await prisma.user.update({
      where: { id },
      data: updatedData,
    });

    return NextResponse.json({ cashier: updatedCashier });
  } catch (error) {
    console.error("Ошибка при обновлении кассира:", error);
    return NextResponse.json({ message: "Ошибка сервера" }, { status: 500 });
  }
}
