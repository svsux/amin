import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ message: "Доступ запрещен" }, { status: 403 });
  }
  const cashiers = await prisma.user.findMany({
    where: { role: "CASHIER" },
    select: { id: true, email: true },
  });
  return NextResponse.json({ cashiers });
}