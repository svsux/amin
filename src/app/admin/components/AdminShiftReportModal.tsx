"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import PrimaryButton from "./PrimaryButton";

export interface AdminReportData {
  id: string;
  cashierName: string;
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
  reportData: AdminReportData | null;
  onClose: () => void;
}

const AdminShiftReportModal: React.FC<Props> = ({ isOpen, reportData, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && reportData && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#121418] rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-[#1E2228]"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-center text-white">Отчет по смене</h2>
            <div className="space-y-4 text-[#A0A8B8]">
              <div className="flex justify-between text-sm bg-[#1E2228] p-3 rounded-md">
                <span>Кассир:</span>
                <span className="font-semibold text-white">{reportData.cashierName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Открыта:</span>
                <span className="font-semibold">{new Date(reportData.openedAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Закрыта:</span>
                <span className="font-semibold">{new Date(reportData.closedAt).toLocaleString()}</span>
              </div>
              
              <hr className="my-4 border-t border-[#1E2228]" />

              <h3 className="font-bold text-lg pt-2 text-white">Финансы</h3>
              <div className="flex justify-between">
                <span>Оплачено картой:</span>
                <span className="font-semibold">{reportData.totalCardSales.toFixed(2)}₽</span>
              </div>
              <div className="flex justify-between">
                <span>Оплачено QR:</span>
                <span className="font-semibold">{reportData.totalQrSales.toFixed(2)}₽</span>
              </div>
              <div className="flex justify-between text-xl mt-2 text-white">
                <span className="font-bold">Итоговая выручка:</span>
                <span className="font-bold text-green-400">{reportData.totalSales.toFixed(2)}₽</span>
              </div>

              <hr className="my-4 border-t border-[#1E2228]" />

              <h3 className="font-bold text-lg pt-2 text-white">Проданные товары ({reportData.transactionCount} транзакций)</h3>
              {reportData.soldProducts.length > 0 ? (
                <ul className="space-y-1 max-h-40 overflow-y-auto pr-2 text-sm border border-[#1E2228] rounded-md p-2 bg-[#0F1115]">
                  {reportData.soldProducts.map((product, index) => (
                    <li key={index} className="flex justify-between hover:bg-[#1E2228]/50 px-1 rounded transition-colors">
                      <span>{product.name}</span>
                      <span className="font-semibold">x {product.quantity}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[#A0A8B8]">Продаж не было.</p>
              )}
            </div>
            
            <div className="flex justify-center mt-6">
              <PrimaryButton onClick={onClose}>
                Закрыть
              </PrimaryButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdminShiftReportModal;