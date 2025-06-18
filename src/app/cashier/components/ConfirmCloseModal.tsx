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
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-[#181B20] border border-[#23262B] p-6 rounded-2xl shadow-2xl max-w-sm w-full transform transition-all duration-300 ease-in-out
          ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
      >
        <h2 className="text-xl font-bold mb-4 text-white">Подтверждение</h2>
        <p className="mb-6 text-gray-300">Смена не закрыта. Хотите закрыть смену перед выходом?</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md bg-[#23262B] text-gray-200 hover:bg-[#23262B]/80 transition"
          >
            Нет, остаться
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
          >
            Да, закрыть и выйти
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmCloseModal;