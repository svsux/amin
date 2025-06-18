"use client";

import React, { useEffect, useState } from "react";

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
    return <div className="text-gray-400">Загрузка информации о магазине...</div>;
  }

  if (error) {
    return <div className="text-red-400">Ошибка: {error}</div>;
  }

  if (!data) {
    return <div className="text-gray-400">Данные не найдены.</div>;
  }

  return (
    <header className="bg-indigo-700 rounded-2xl px-6 py-3 flex items-start w-full">
      <div className="flex justify-between items-start w-full gap-4">
        <div>
          <h1 className="text-lg font-bold text-white">{data.store.name}</h1>
          <p className="text-sm text-indigo-100">{data.store.address}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-indigo-100">Кассир:</p>
          <p className="text-sm text-white font-medium">
            {data.cashier.name || data.cashier.email || "Кассир не определен"}
          </p>
        </div>
      </div>
    </header>
  );
};

export default StoreHeader;
