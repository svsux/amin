import { del, put } from '@vercel/blob';
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

// Функция для РЕДАКТИРОВАНИЯ товара
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "Доступ запрещен" }, { status: 403 });
    }

    const productId = params.id;
    const formData = await req.formData();

    const name = formData.get('name') as string;
    const purchasePrice = parseFloat(formData.get('purchasePrice') as string);
    const salePrice = parseFloat(formData.get('salePrice') as string);
    const quantity = parseInt(formData.get('quantity') as string, 10);
    const stores = JSON.parse(formData.get('stores') as string) as string[];
    const imageFile = formData.get('image') as File | null;

    if (!name || isNaN(purchasePrice) || isNaN(salePrice) || isNaN(quantity) || !stores) {
        return NextResponse.json({ message: 'Все поля, кроме изображения, обязательны.' }, { status: 400 });
    }

    const existingProduct = await prisma.product.findUnique({
        where: { id: productId },
    });

    if (!existingProduct) {
        return NextResponse.json({ message: 'Товар не найден' }, { status: 404 });
    }

    let imageUrl = existingProduct.imageUrl;

    // Если пришел новый файл изображения
    if (imageFile && imageFile.size > 0) {
        // 1. Если было старое изображение, удаляем его из Vercel Blob
        if (existingProduct.imageUrl) {
            await del(existingProduct.imageUrl);
        }
        // 2. Загружаем новое изображение в Vercel Blob
        const blob = await put(imageFile.name, imageFile, { access: 'public' });
        imageUrl = blob.url; // 3. Обновляем URL
    }

    // Используем транзакцию для атомарного обновления товара и его связей с магазинами
    const [, updatedProduct] = await prisma.$transaction([
        prisma.storeProduct.deleteMany({ where: { productId: productId } }),
        prisma.storeProduct.createMany({
            data: stores.map(storeId => ({ productId: productId, storeId: storeId })),
        }),
        prisma.product.update({
            where: { id: productId },
            data: { name, purchasePrice, salePrice, quantity, imageUrl },
        }),
    ]);

    return NextResponse.json({ message: 'Товар успешно обновлен!', product: updatedProduct }, { status: 200 });

  } catch (error: any) {
    console.error("❌ Ошибка при обновлении товара:", error);
    return NextResponse.json({ message: "Ошибка сервера при обновлении товара", details: error.message }, { status: 500 });
  }
}

// Функция для УДАЛЕНИЯ товара
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "Доступ запрещен" }, { status: 403 });
    }

    const productId = params.id;
    const productToDelete = await prisma.product.findUnique({ where: { id: productId } });

    if (!productToDelete) {
      return NextResponse.json({ message: "Товар не найден" }, { status: 404 });
    }

    // Если у товара было изображение, удаляем его из Vercel Blob
    if (productToDelete.imageUrl) {
        await del(productToDelete.imageUrl);
    }

    // Удаляем товар (связи в StoreProduct удалятся каскадно)
    await prisma.product.delete({ where: { id: productId } });

    return NextResponse.json({ message: "Товар успешно удален" }, { status: 200 });
  } catch (error: any) {
    console.error("Ошибка при удалении товара:", error);
    if (error.code === 'P2003') {
      return NextResponse.json({ message: "Невозможно удалить товар, так как он используется в транзакциях." }, { status: 409 });
    }
    return NextResponse.json({ message: "Ошибка сервера при удалении товара", details: error.message }, { status: 500 });
  }
}
