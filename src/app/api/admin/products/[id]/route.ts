import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"; // ИЛИ "@prisma/client" для старых версий
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "Доступ запрещен" }, { status: 403 });
    }

    const productId = params.id;
    if (!productId) {
        return NextResponse.json({ message: "ID товара не указан" }, { status: 400 });
    }

    const formData = await req.formData();

    const name = formData.get("name") as string | null;
    const purchasePriceStr = formData.get("purchasePrice") as string | null;
    const salePriceStr = formData.get("salePrice") as string | null;
    const quantityStr = formData.get("quantity") as string | null;
    const storesRaw = formData.get("stores") as string | null; // Ожидаем JSON строку ID магазинов
    
    const image = formData.get("image") as File | null;

    const existingProduct = await prisma.product.findUnique({ where: { id: productId } });

    if (!existingProduct) {
      return NextResponse.json({ message: "Товар не найден" }, { status: 404 });
    }

    const dataToUpdate: {
        name?: string;
        purchasePrice?: number;
        salePrice?: number;
        quantity?: number;
        imageUrl?: string;
    } = {};

    if (name) dataToUpdate.name = name;
    if (purchasePriceStr) dataToUpdate.purchasePrice = parseFloat(purchasePriceStr);
    if (salePriceStr) dataToUpdate.salePrice = parseFloat(salePriceStr);
    if (quantityStr) dataToUpdate.quantity = parseInt(quantityStr, 10);

    if (image && image.size > 0) {
      if (existingProduct.imageUrl) {
        try {
          const oldImagePath = path.join(process.cwd(), "public", existingProduct.imageUrl);
          await unlink(oldImagePath);
          console.log(`Старое изображение ${existingProduct.imageUrl} удалено.`);
        } catch (error) {
          console.error("Ошибка при удалении старого изображения:", error);
        }
      }

      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${Date.now()}-${image.name.replace(/\s+/g, '_')}`;
      const filePath = path.join(process.cwd(), "public", "uploads", fileName);
      await writeFile(filePath, buffer);
      dataToUpdate.imageUrl = `/uploads/${fileName}`;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: dataToUpdate,
    });

    if (storesRaw) {
        const storeIds = JSON.parse(storesRaw) as string[];
        // Удалить старые связи
        await prisma.storeProduct.deleteMany({
            where: { productId: productId },
        });
        // Создать новые связи, если они есть
        if (storeIds.length > 0) {
            await prisma.storeProduct.createMany({
            data: storeIds.map((storeId) => ({
                storeId,
                productId: productId,
            })),
            skipDuplicates: true,
            });
        }
    }
    
    const productWithStores = await prisma.product.findUnique({
        where: { id: updatedProduct.id },
        include: {
            storeProducts: {
                include: { store: true },
            },
        },
    });

    return NextResponse.json(productWithStores, { status: 200 });
  } catch (error: any) {
    console.error("❌ Ошибка при обновлении товара:", error);
    if (error instanceof SyntaxError && error.message.includes("JSON")) {
        return NextResponse.json({ message: "Ошибка в формате данных магазинов (JSON)" }, { status: 400 });
    }
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') { // ИСПРАВЛЕНО
        return NextResponse.json({ message: "Товар для обновления не найден." }, { status: 404 });
    }
    return NextResponse.json({ message: "Ошибка сервера при обновлении товара", details: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "Доступ запрещен" }, { status: 403 });
    }

    const productId = params.id;

    if (!productId) {
      return NextResponse.json({ message: "ID товара не указан" }, { status: 400 });
    }

    const productToDelete = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!productToDelete) {
      return NextResponse.json({ message: "Товар не найден" }, { status: 404 });
    }

    // Сначала удаляем связанные записи в StoreProduct
    await prisma.storeProduct.deleteMany({
      where: { productId: productId },
    });

    // Затем удаляем сам товар
    await prisma.product.delete({
      where: { id: productId },
    });

    // Если у товара было изображение, удаляем его
    if (productToDelete.imageUrl) {
      try {
        const imagePath = path.join(process.cwd(), "public", productToDelete.imageUrl);
        await unlink(imagePath);
        console.log(`Изображение ${productToDelete.imageUrl} успешно удалено.`);
      } catch (imageError) {
        console.error(`Ошибка при удалении файла изображения ${productToDelete.imageUrl}:`, imageError);
        // Не прерываем основной процесс, если файл не удалось удалить, но логируем ошибку
      }
    }

    return NextResponse.json({ message: "Товар успешно удален" }, { status: 200 });
  } catch (error: any) {
    console.error("Ошибка при удалении товара:", error);
    if (error instanceof PrismaClientKnownRequestError) { // ИСПРАВЛЕНО
        if (error.code === 'P2003') { // Foreign key constraint failed
             return NextResponse.json({ message: "Невозможно удалить товар, так как он связан с другими записями (например, в заказах)." }, { status: 409 }); // 409 Conflict
        }
        if (error.code === 'P2025') { // Record to delete not found
            return NextResponse.json({ message: "Товар для удаления не найден." }, { status: 404 });
        }
    }
    return NextResponse.json({ message: "Ошибка сервера при удалении товара", details: error.message }, { status: 500 });
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

    // Логируем значение storesRaw для отладки
    console.log("Server: storesRaw:", storesRaw);

    // Валидация основных полей
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
        console.log("Server: storeIds после парсинга:", storeIds);
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

    return NextResponse.json({ product: productWithStores }, { status: 201 });
  } catch (error) {
    console.error("Ошибка при создании товара:", error);
    if (error instanceof SyntaxError && error.message.includes("JSON")) {
      return NextResponse.json({ message: "Ошибка в формате данных магазинов (JSON)" }, { status: 400 });
    }
    return NextResponse.json({ message: "Ошибка сервера при создании товара" }, { status: 500 });
  }
}

// Пример обработчика GET для одного товара по ID (раскомментируйте и адаптируйте при необходимости)
/*
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Опционально: проверка сессии для GET запроса
    // const session = await getServerSession(authOptions);
    // if (!session || session.user?.role !== "ADMIN") { // Или другая проверка, если доступно не только админам
    //   return NextResponse.json({ message: "Доступ запрещен" }, { status: 403 });
    // }

    const productId = params.id;
    if (!productId) {
      return NextResponse.json({ message: "ID товара не указан" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        storeProducts: {
          include: { store: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ message: "Товар не найден" }, { status: 404 });
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error: any) {
    console.error("Ошибка при получении товара:", error);
    if (error instanceof PrismaClientKnownRequestError) { // ИСПРАВЛЕНО (если будете использовать здесь)
        // ... обработка ошибок Prisma ...
    }
    return NextResponse.json({ message: "Ошибка сервера при получении товара", details: error.message }, { status: 500 });
  }
}
*/
