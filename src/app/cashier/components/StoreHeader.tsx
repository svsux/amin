"use client";

import React, { useEffect, useState } from "react";

// Интерфейс для данных, ожидающий и имя, и email
interface StoreInfo {
  store: {
    id: string;
    name: string;
    address: string;
  };
  cashier: {
    name: string | null;
    email: string | null;
  };
}

const StoreHeader: React.FC = () => {
  const [data, setData] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/cashier/store");
        if (!response.ok) {
          throw new Error("Не удалось загрузить данные магазина.");
        }
        const responseData: StoreInfo = await response.json();
        setData(responseData);
      } catch (err) {
        setError((err as Error).message || "Ошибка при загрузке данных.");
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, []);

  if (loading) {
    return <div className="text-gray-500">Загрузка информации о магазине...</div>;
  }

  if (error) {
    return <div className="text-red-500">Ошибка: {error}</div>;
  }

  if (!data) {
    return <div className="text-gray-500">Данные не найдены.</div>;
  }

  return (
    <header className="bg-indigo-600 text-white p-4 rounded-lg shadow-md flex items-center h-full">
      <div className="flex justify-between items-center w-full">
        <div>
          <h1 className="text-xl font-bold">{data.store.name}</h1>
          <p className="text-sm">{data.store.address}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold">Кассир:</p>
          {/* Отображаем имя, если его нет - email */}
          <p>{data.cashier.name || data.cashier.email || "Кассир не определен"}</p>
        </div>
      </div>
    </header>
  );
};

export default StoreHeader;