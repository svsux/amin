import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "Доступ запрещен." }, { status: 403 });
    }

    const shiftId = params.id;

    if (!shiftId) {
      return NextResponse.json({ message: "ID смены не указан." }, { status: 400 });
    }

    // Prisma автоматически обработает каскадное удаление связанных транзакций и их элементов,
    // если в вашей schema.prisma установлены соответствующие правила (onDelete: Cascade).
    // Если нет, их нужно будет удалять вручную в транзакции.
    await prisma.shift.delete({
      where: { id: shiftId },
    });

    return NextResponse.json({ message: "Отчет по смене успешно удален." });

  } catch (error) {
    console.error("Ошибка при удалении отчета:", error);
    return NextResponse.json({ message: "Ошибка сервера при удалении отчета." }, { status: 500 });
  }
}