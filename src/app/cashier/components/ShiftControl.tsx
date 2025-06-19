"use client";

import React from "react";

interface Props {
  label: string; // Текст на кнопке
  onClick: () => void; // Действие при нажатии
  isLoading: boolean; // Состояние загрузки
  isDisabled?: boolean; // Дополнительное условие блокировки
}

const ShiftControl: React.FC<Props> = ({ label, onClick, isLoading, isDisabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading || isDisabled}
      className="w-full max-w-[260px] py-2 px-5 rounded-md text-white font-semibold transition-colors bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed"
    >
      {isLoading ? "Обработка..." : label}
    </button>
  );
};

export default ShiftControl;
