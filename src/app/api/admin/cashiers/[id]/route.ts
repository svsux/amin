import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import bcrypt from "bcryptjs";

export async function DELETE(request: Request, context: any) {
  const { params } = context;
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ message: "Доступ запрещен" }, { status: 403 });
  }
  const { id } = params;
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ message: "Кассир удалён" });
}

export async function PATCH(request: Request, context: any) {
  const { params } = context;
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ message: "Доступ запрещен" }, { status: 403 });
  }
  const { id } = params;
  const { password } = await request.json();
  if (!password || password.length < 6) {
    return NextResponse.json({ message: "Пароль слишком короткий" }, { status: 400 });
  }
  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id }, data: { password: hashed } });
  return NextResponse.json({ message: "Пароль обновлён" });
}