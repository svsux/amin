"use client";

import React, { useEffect, useState } from "react";

interface Transaction {
  id: string;
  total: number;
  paymentMethod: string;
  createdAt: string;
  products: { name: string; quantity: number }[];
}

interface Props {
  isShiftOpen: boolean;
  dataVersion: number; // Добавляем новый проп
}

const TransactionLogs: React.FC<Props> = ({ isShiftOpen, dataVersion }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/cashier/transactions/logs");
        if (!response.ok) {
          throw new Error("Не удалось загрузить логи транзакций.");
        }
        const data: Transaction[] = await response.json();
        setTransactions(data);
      } catch (err) {
        setError((err as Error).message || "Ошибка при загрузке логов транзакций.");
      } finally {
        setLoading(false);
      }
    };

    if (isShiftOpen) {
      fetchTransactions();
    } else {
      setTransactions([]); // Очищаем логи, если смена закрыта
    }
  }, [isShiftOpen, dataVersion]); // Обновляем логи при изменении статуса смены или по триггеру

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-4 relative">
      {!isShiftOpen && transactions.length === 0 && (
         <div className="absolute inset-0 bg-gray-200 bg-opacity-75 flex justify-center items-center z-10 rounded-lg">
          <p className="text-lg font-bold text-gray-700">Смена закрыта</p>
        </div>
      )}
      <h2 className="text-xl font-bold text-gray-800">История операций</h2>
      
      {loading && <div className="text-gray-500 text-sm">Загрузка логов...</div>}
      {error && <div className="text-red-500 text-sm">Ошибка: {error}</div>}
      
      {!loading && !error && (
        <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-sm">Операций пока не было.</p>
          ) : (
            transactions.map((transaction) => (
              <li key={transaction.id} className="border-b pb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-gray-700">{transaction.total.toFixed(2)}₽</span>
                  <span className="text-xs text-gray-500">{new Date(transaction.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-600">
                  Оплата: {transaction.paymentMethod === "card" ? "Карта" : "Наличные"}
                </p>
                <ul className="pl-4 mt-1 text-xs text-gray-500 list-disc list-inside">
                  {transaction.products.map((product, index) => (
                    <li key={index}>
                      {product.name} x {product.quantity}
                    </li>
                  ))}
                </ul>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default TransactionLogs;