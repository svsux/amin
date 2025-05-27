import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import bcrypt from "bcryptjs";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "Доступ запрещен" }, { status: 403 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ message: "ID кассира не указан" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: "Кассир удалён" });
  } catch (error) {
    console.error("Ошибка при удалении кассира:", error);
    return NextResponse.json({ message: "Ошибка сервера" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "Доступ запрещен" }, { status: 403 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ message: "ID кассира не указан" }, { status: 400 });
    }

    const { password } = await request.json();
    if (!password || password.length < 6) {
      return NextResponse.json({ message: "Пароль слишком короткий" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { id }, data: { password: hashed } });
    return NextResponse.json({ message: "Пароль обновлён" });
  } catch (error) {
    console.error("Ошибка при обновлении пароля кассира:", error);
    return NextResponse.json({ message: "Ошибка сервера" }, { status: 500 });
  }
}