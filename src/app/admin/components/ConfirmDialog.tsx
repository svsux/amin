import React from "react";
import { FiAlertCircle } from "react-icons/fi";
import { motion } from "framer-motion"; // Импортируем motion

export default function ConfirmDialog({
  open,
  message,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }} // Для AnimatePresence
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="bg-[#121418] rounded-lg shadow-lg p-6 w-full max-w-md border border-[#1E2228]"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }} // Для AnimatePresence
        transition={{ duration: 0.2, delay: 0.05 }}
      >
        <div className="flex items-start gap-3 mb-4">
          <FiAlertCircle className="text-[#FF3B30] w-6 h-6 mt-1" />
          <div>
            <h2 className="text-lg font-semibold text-white">Подтвердите удаление</h2>
            <p className="text-sm text-[#A0A8B8] mt-1">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md border border-[#1E2228] text-sm text-[#A0A8B8] hover:bg-[#1E2228]"
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-[#FF3B30] text-white text-sm hover:bg-red-600"
          >
            Удалить
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
