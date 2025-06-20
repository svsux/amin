import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "CASHIER") {
    return NextResponse.json({ message: "Доступ запрещен." }, { status: 403 });
  }

  const openShift = await prisma.shift.findFirst({
    where: {
      cashierId: session.user.id,
      closedAt: null, // ИСПРАВЛЕНО: Используем 'closedAt'
    },
  });

  return NextResponse.json({ isShiftOpen: !!openShift });
}