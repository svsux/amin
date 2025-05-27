// filepath: c:\Users\murza\Desktop\Stash\amin\src\app\cashier\page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CashierPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <p className="flex justify-center items-center min-h-screen">Загрузка...</p>;
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return <p className="flex justify-center items-center min-h-screen">Перенаправление на страницу входа...</p>;
  }

  // Проверяем, есть ли сессия и пользователь, и соответствует ли роль
  if (session?.user?.role !== "CASHIER") {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Доступ запрещен</h1>
        <p className="mb-4">У вас нет прав для доступа к этой странице.</p>
        <p className="mb-2">Доступные роли: USER, ADMIN, CASHIER.</p>
        <p className="mb-4">Ваша текущая роль: {session?.user?.role || "не определена"}</p>
        <Link href="/" className="text-blue-500 hover:underline">
          Вернуться на главную
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Касса</h1>
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-800">
            На главную
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Рабочее место кассира</h2>
          {/* TODO: Реализовать интерфейс кассы */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-500">Интерфейс кассы будет здесь.</p>
            <p className="text-sm text-gray-400 mt-2">
              Например, выбор товаров, расчет суммы, прием оплаты.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}