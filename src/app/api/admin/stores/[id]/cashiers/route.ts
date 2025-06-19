import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prismaClient from "@/lib/prisma";

export async function PATCH(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Доступ запрещен" }, { status: 403 });
    }

    const { id: storeId } = context.params;
    const { cashierIds = [] } = await req.json();

    if (!Array.isArray(cashierIds)) {
        return NextResponse.json({ message: "Неверный формат данных." }, { status: 400 });
    }

    await prismaClient.$transaction(async (prisma) => {
      await prisma.storeCashier.deleteMany({ where: { storeId: storeId } });
      if (cashierIds.length > 0) {
        await prisma.storeCashier.createMany({
          data: cashierIds.map((cashierId: string) => ({
            storeId: storeId,
            cashierId: cashierId,
            assignedBy: session.user!.email!,
          })),
        });
      }
    });

    return NextResponse.json({ message: "Кассиры успешно обновлены." });
  } catch (error: any) {
    console.error("Ошибка при обновлении кассиров магазина:", error);
    return NextResponse.json({ message: "Ошибка сервера", details: error.message }, { status: 500 });
  }
}