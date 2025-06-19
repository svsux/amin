"use client";

import React from "react";

// ИЗМЕНЕНО: Интерфейс для props, а не для внутреннего состояния
interface Props {
  store?: {
    name: string;
    address: string;
  };
  cashier?: {
    name: string | null;
    email: string | null;
  };
}

// ИЗМЕНЕНО: Компонент теперь принимает props
const StoreHeader: React.FC<Props> = ({ store, cashier }) => {
  // УДАЛЕНО: Вся логика useState и useEffect для загрузки данных

  // ИЗМЕНЕНО: Проверяем наличие props, а не внутреннего состояния
  if (!store || !cashier) {
    return (
      <div>
        <h1 className="text-lg font-bold text-gray-400">Смена не открыта</h1>
        <p className="text-sm text-gray-500">Откройте смену, чтобы начать работу.</p>
      </div>
    );
  }

  return (
    <header className="flex items-start w-full">
      <div className="flex justify-between items-start w-full gap-4">
        <div>
          <h1 className="text-lg font-bold text-white">{store.name}</h1>
          <p className="text-sm text-indigo-100">{store.address}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-indigo-100">Кассир:</p>
          <p className="text-sm text-white font-medium">
            {cashier.name || cashier.email || "Кассир не определен"}
          </p>
        </div>
      </div>
    </header>
  );
};

export default StoreHeader;
