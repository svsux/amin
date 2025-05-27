import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions"; // Убедитесь, что путь к authOptions верный
import prisma from "@/lib/prisma"; // Убедитесь, что путь к prisma client верный
import bcrypt from "bcryptjs";
// Определяем UserRole вручную, если он не экспортируется из @prisma/client
enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
  CASHIER = "CASHIER",
  // Добавьте другие роли, если они есть в вашей Prisma схеме
}

export async function POST(req: Request) {
  try {
    // 1. Проверка сессии и роли администратора
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Доступ запрещен: требуется авторизация администратора." },
        { status: 403 }
      );
    }

    // 2. Получение данных из тела запроса
    const { email, password, role } = (await req.json()) as {
      email?: string;
      password?: string;
      role?: UserRole; // Используем тип UserRole
    };

    // 3. Валидация входных данных
    if (!email || !password || !role) {
      return NextResponse.json(
        { message: "Отсутствуют обязательные поля: email, password, role." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Пароль должен содержать не менее 6 символов." },
        { status: 400 }
      );
    }

    // Проверка, является ли роль допустимой (хотя мы жестко задаем CASHIER на клиенте, это хорошая практика)
    if (!Object.values(UserRole).includes(role)) {
        return NextResponse.json({ message: "Недопустимая роль пользователя." }, { status: 400 });
    }


    // 4. Проверка, существует ли пользователь с таким email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Пользователь с таким email уже существует." },
        { status: 409 } // Conflict
      );
    }

    // 5. Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Создание пользователя в базе данных
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role, // Используем полученную роль
      },
    });

    // Не возвращаем пароль в ответе
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      { message: "Пользователь успешно создан.", user: userWithoutPassword },
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