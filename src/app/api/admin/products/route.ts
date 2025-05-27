import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { writeFile } from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "Доступ запрещен" }, { status: 403 });
    }

    const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Ошибка при получении списка товаров:", error);
    return NextResponse.json({ message: "Ошибка сервера" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
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

    // Проверка обязательных данных
    if (!name || isNaN(purchasePrice) || isNaN(salePrice) || isNaN(quantity)) {
      return NextResponse.json(
        { message: "Все поля (name, purchasePrice, salePrice, quantity) обязательны." },
        { status: 400 }
      );
    }

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

    if (storeIds.length === 0) {
      return NextResponse.json(
        { message: "Выберите хотя бы один магазин." },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        purchasePrice,
        salePrice,
        quantity,
        imageUrl,
      },
    });

    await prisma.storeProduct.createMany({
      data: storeIds.map((storeId) => ({
        storeId,
        productId: product.id,
      })),
      skipDuplicates: true,
    });

    const productWithStores = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        storeProducts: {
          include: { store: true },
        },
      },
    });

    return NextResponse.json({ product: productWithStores });
  } catch (error) {
    console.error("Ошибка при создании товара:", error);
    return NextResponse.json({ message: "Ошибка сервера" }, { status: 500 });
  }
}