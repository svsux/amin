import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

// Роли вручную, если не импортируешь из @prisma/client
enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
  CASHIER = "CASHIER",
}

export async function POST(req: Request) {
  try {
    // 1. Проверка сессии
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Доступ запрещён: только для администратора." },
        { status: 403 }
      );
    }

    // 2. Парсинг тела запроса
    const { email, password, role } = (await req.json()) as {
      email?: string;
      password?: string;
      role?: UserRole;
    };

    // 3. Валидация
    if (!email || !password || !role) {
      return NextResponse.json(
        { message: "Заполните email, пароль и роль." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Пароль должен содержать минимум 6 символов." },
        { status: 400 }
      );
    }

    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json(
        { message: "Недопустимая роль." },
        { status: 400 }
      );
    }

    // 4. Проверка на существующего пользователя
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: "Пользователь с таким email уже существует." },
        { status: 409 }
      );
    }

    // 5. Хеш пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Создание пользователя
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword, // ✅ ← исправлено здесь
        role,
      },
    });

    const { passwordHash, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      { message: "Пользователь создан.", user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error("Ошибка при создании пользователя:", error);
    return NextResponse.json(
      { message: "Внутренняя ошибка сервера." },
      { status: 500 }
    );
  }
}
