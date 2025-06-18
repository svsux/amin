"use client";

import React from "react";

interface Props {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmCloseModal: React.FC<Props> = ({ isOpen, onConfirm, onCancel }) => {
  return (
    <div
      className={`fixed inset-0 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out
        ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onCancel} // Закрытие по клику на фон
    >
      <div
        onClick={(e) => e.stopPropagation()} // Предотвращает закрытие при клике на само окно
        className={`bg-white p-6 rounded-lg shadow-xl max-w-sm w-full transform transition-all duration-300 ease-in-out
          ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
      >
        <h2 className="text-xl font-bold mb-4 text-gray-900">Подтверждение</h2>
        <p className="mb-6 text-gray-700">Смена не закрыта. Хотите закрыть смену перед выходом?</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            Нет, остаться
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
          >
            Да, закрыть и выйти
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmCloseModal;