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

    console.log("Server: ID кассира для удаления:", id);

    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "ADMIN") {
      console.error("Server: Доступ запрещен");
      return NextResponse.json({ message: "Доступ запрещен" }, { status: 403 });
    }

    const cashier = await prisma.user.findUnique({ where: { id } });

    console.log("Server: Найденный кассир:", cashier);

    if (!cashier || cashier.role !== "CASHIER") {
      console.error("Server: Кассир не найден или не является кассиром");
      return NextResponse.json({ message: "Кассир не найден" }, { status: 404 });
    }

    const linkedStores = await prisma.storeCashier.findMany({ where: { cashierId: id } });

    if (linkedStores.length > 0) {
      console.error("Server: Кассир связан с магазинами");
      return NextResponse.json(
        { message: "Невозможно удалить кассира, так как он связан с магазинами. Отвяжите кассира от магазинов перед удалением." },
        { status: 409 }
      );
    }

    await prisma.user.delete({ where: { id } });

    console.log("Server: Кассир успешно удалён");
    return NextResponse.json({ message: "Кассир успешно удалён" });
  } catch (error) {
    const err = error as Error;
    console.error("Ошибка при удалении кассира:", err);
    return NextResponse.json(
      { message: "Ошибка сервера", details: err.message || "Неизвестная ошибка" },
      { status: 500 }
    );
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
