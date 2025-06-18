"use client";

import React from "react";

export interface ReportData {
  totalSales: number;
  transactionCount: number;
  openedAt: string;
  closedAt: string;
  totalCardSales: number;
  totalQrSales: number;
  soldProducts: { name: string; quantity: number }[];
}

interface Props {
  isOpen: boolean;
  reportData: ReportData | null;
  onClose: () => void;
}

const ShiftReportModal: React.FC<Props> = ({ isOpen, reportData, onClose }) => {
  const show = isOpen && reportData;

  return (
    <div
      className={`fixed inset-0 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out
        ${show ? "opacity-100 visible" : "opacity-0 invisible"}`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white p-6 rounded-lg shadow-xl max-w-lg w-full transform transition-all duration-300 ease-in-out
          ${show ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
      >
        {reportData && (
          <>
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-900">Отчет по смене</h2>
            <div className="space-y-4 text-gray-800">
              <div className="flex justify-between text-sm">
                <span>Открыта:</span>
                <span className="font-semibold">{new Date(reportData.openedAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Закрыта:</span>
                <span className="font-semibold">{new Date(reportData.closedAt).toLocaleString()}</span>
              </div>
              
              <hr />

              <h3 className="font-bold text-lg pt-2">Финансы</h3>
              <div className="flex justify-between">
                <span>Оплачено картой:</span>
                <span className="font-semibold">{reportData.totalCardSales.toFixed(2)}₽</span>
              </div>
              <div className="flex justify-between">
                <span>Оплачено наличными:</span>
                <span className="font-semibold">{reportData.totalQrSales.toFixed(2)}₽</span>
              </div>
              <div className="flex justify-between text-xl mt-2">
                <span className="font-bold">Итоговая выручка:</span>
                <span className="font-bold text-green-600">{reportData.totalSales.toFixed(2)}₽</span>
              </div>

              <hr />

              <h3 className="font-bold text-lg pt-2">Проданные товары ({reportData.transactionCount} транзакций)</h3>
              {reportData.soldProducts.length > 0 ? (
                <ul className="space-y-1 max-h-40 overflow-y-auto pr-2 text-sm border rounded-md p-2 bg-gray-50">
                  {reportData.soldProducts.map((product, index) => (
                    <li key={index} className="flex justify-between">
                      <span>{product.name}</span>
                      <span className="font-semibold">x {product.quantity}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Продаж не было.</p>
              )}
            </div>
            
            <div className="flex justify-center mt-6">
              <button
                onClick={onClose}
                className="w-full px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
              >
                OK
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ShiftReportModal;