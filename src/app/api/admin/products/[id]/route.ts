import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { writeFile } from "fs/promises";
import path from "path";

// Получение товара по id (GET /api/admin/products/[id])
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // Проверяем, существует ли товар
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      storeProducts: {
        include: { store: true },
      },
    },
  });

  if (!product) {
    return NextResponse.json({ message: "Товар не найден" }, { status: 404 });
  }

  return NextResponse.json({ product });
}

// Обновление товара по id (PATCH /api/admin/products/[id])
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ message: "Доступ запрещен" }, { status: 403 });
  }

  const formData = await req.formData();
  const name = formData.get("name") as string;
  const purchasePrice = parseFloat(formData.get("purchasePrice") as string);
  const salePrice = parseFloat(formData.get("salePrice") as string);
  const quantity = parseInt(formData.get("quantity") as string, 10) || 0;
  const image = formData.get("image") as File | null;

  let imageUrl: string | undefined = undefined;
  if (image && image.size > 0) {
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${image.name}`;
    const filePath = path.join(process.cwd(), "public", "uploads", fileName);
    await writeFile(filePath, buffer);
    imageUrl = `/uploads/${fileName}`;
  }

  const storeIds = formData.getAll("storeIds") as string[];

  // Проверяем, что переданы магазины
  if (storeIds.length === 0) {
    return NextResponse.json(
      { message: "Выберите хотя бы один магазин." },
      { status: 400 }
    );
  }

  // 1. Удаляем все старые связи товара с магазинами
  await prisma.storeProduct.deleteMany({
    where: { productId: id },
  });

  // 2. Создаём новые связи
  await prisma.storeProduct.createMany({
    data: storeIds.map((storeId) => ({
      storeId,
      productId: id,
    })),
    skipDuplicates: true,
  });

  // 3. Обновляем сам товар
  const product = await prisma.product.update({
    where: { id },
    data: {
      name,
      purchasePrice,
      salePrice,
      quantity,
      ...(imageUrl ? { imageUrl } : {}),
    },
    include: {
      storeProducts: {
        include: { store: true },
      },
    },
  });

  return NextResponse.json({ product });
}

// Удаление товара по id (DELETE /api/admin/products/[id])
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ message: "Доступ запрещен" }, { status: 403 });
  }

  // Удаляем связи с магазинами
  await prisma.storeProduct.deleteMany({ where: { productId: id } });

  // Удаляем сам товар
  await prisma.product.delete({ where: { id } });

  return NextResponse.json({ message: "Товар удалён" });
}