import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { writeFile } from "fs/promises";
import path from "path";

// Отключаем кэширование
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "Доступ запрещен" }, { status: 403 });
    }

    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        storeProducts: {
          include: {
            store: true,
          },
        },
      },
    });
    // Возвращаем массив, а не объект
    return NextResponse.json(products);
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
    const purchasePriceStr = formData.get("purchasePrice") as string;
    const salePriceStr = formData.get("salePrice") as string;
    const quantityStr = formData.get("quantity") as string;
    const image = formData.get("image") as File | null;
    const storesRaw = formData.get("stores") as string | null;

    if (!name || !purchasePriceStr || !salePriceStr || !quantityStr) {
      return NextResponse.json(
        { message: "Поля name, purchasePrice, salePrice, quantity обязательны." },
        { status: 400 }
      );
    }

    const purchasePrice = parseFloat(purchasePriceStr);
    const salePrice = parseFloat(salePriceStr);
    const quantity = parseInt(quantityStr, 10);

    if (isNaN(purchasePrice) || isNaN(salePrice) || isNaN(quantity)) {
      return NextResponse.json(
        { message: "Поля purchasePrice, salePrice, quantity должны быть числами." },
        { status: 400 }
      );
    }

    let storeIds: string[] = [];
    if (storesRaw) {
      try {
        storeIds = JSON.parse(storesRaw);
        if (!Array.isArray(storeIds) || !storeIds.every((id) => typeof id === "string")) {
          throw new Error("storeIds должен быть массивом строк");
        }
      } catch (e) {
        return NextResponse.json(
          { message: "Некорректный формат данных для магазинов (ожидается JSON массив ID)." },
          { status: 400 }
        );
      }
    }

    if (storeIds.length === 0) {
      return NextResponse.json(
        { message: "Выберите хотя бы один магазин." },
        { status: 400 }
      );
    }

    let imageUrl: string | undefined = undefined;
    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${Date.now()}-${image.name.replace(/\s+/g, "_")}`;
      const filePath = path.join(process.cwd(), "public", "uploads", fileName);
      await writeFile(filePath, buffer);
      imageUrl = `/uploads/${fileName}`;
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

    // Возвращаем объект с ключом product
    return NextResponse.json({ product: productWithStores }, { status: 201 });
  } catch (error) {
    console.error("Ошибка при создании товара:", error);
    if (error instanceof SyntaxError && error.message.includes("JSON")) {
      return NextResponse.json({ message: "Ошибка в формате данных магазинов (JSON)" }, { status: 400 });
    }
    return NextResponse.json({ message: "Ошибка сервера при создании товара" }, { status: 500 });
  }
}