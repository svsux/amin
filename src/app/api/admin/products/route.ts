import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { writeFile } from "fs/promises";
import path from "path";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ message: "Доступ запрещен" }, { status: 403 });
  }
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ products });
}

export async function POST(req: Request) {
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

  // 1. Создаём товар
  const product = await prisma.product.create({
    data: {
      name,
      purchasePrice,
      salePrice,
      quantity,
      imageUrl,
    },
  });

  // 2. Создаём связи с магазинами
  if (storeIds.length > 0) {
    await prisma.storeProduct.createMany({
      data: storeIds.map(storeId => ({
        storeId,
        productId: product.id,
      })),
      skipDuplicates: true,
    });
  }

  // 3. Возвращаем товар с магазинами
  const productWithStores = await prisma.product.findUnique({
    where: { id: product.id },
    include: {
      storeProducts: {
        include: { store: true },
      },
    },
  });

  return NextResponse.json({ product: productWithStores });
}