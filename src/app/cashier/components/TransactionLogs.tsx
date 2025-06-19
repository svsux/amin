"use client";

import React, { useEffect, useState } from "react";
import { FiCreditCard, FiDollarSign } from "react-icons/fi";

interface Transaction {
  id: string;
  total: number;
  paymentMethod: string;
  createdAt: string;
  products: { name: string; quantity: number }[];
}

interface Props {
  isShiftOpen: boolean;
  dataVersion: number;
}

const TransactionLogs: React.FC<Props> = ({ isShiftOpen, dataVersion }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isShiftOpen) {
      setLoading(true);
      fetch("/api/cashier/transactions/logs")
        .then((res) => res.json())
        .then((data: Transaction[]) => setTransactions(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setTransactions([]);
    }
  }, [isShiftOpen, dataVersion]);

  return (
    <div className="bg-[#181B20] p-6 rounded-xl border border-[#23262B]">
      <h2 className="text-2xl font-bold text-white mb-4">История операций</h2>

      {loading && <div className="text-gray-400 text-sm">Загрузка...</div>}

      {!loading && (
        <div
          className="space-y-3 overflow-y-auto pr-2"
          style={{ maxHeight: "calc(100vh - 200px)" }}
        >
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-sm text-center pt-10">
              Операций пока не было.
            </p>
          ) : (
            transactions.map((tx) => (
              <details
                key={tx.id}
                className="bg-[#23262B] p-3 rounded-lg cursor-pointer transition hover:bg-[#2a2e37]"
              >
                <summary className="flex justify-between items-center list-none">
                  <div className="flex items-center gap-3">
                    {tx.paymentMethod === "card" ? (
                      <FiCreditCard className="text-indigo-400" />
                    ) : (
                      <FiDollarSign className="text-green-400" />
                    )}
                    <span className="font-bold text-white text-lg">
                      {tx.total.toFixed(2)}₽
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(tx.createdAt).toLocaleTimeString()}
                  </span>
                </summary>
                <ul className="pl-4 mt-2 pt-2 border-t border-gray-700 text-xs text-gray-400 list-disc list-inside">
                  {tx.products.map((p, i) => (
                    <li key={i}>
                      {p.name} x {p.quantity}
                    </li>
                  ))}
                </ul>
              </details>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionLogs;