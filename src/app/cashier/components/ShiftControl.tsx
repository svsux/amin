"use client";

import React, { useState } from "react";

interface Props {
  isShiftOpen: boolean;
  onOpenShift: () => void;
  onCloseShift: () => Promise<any>;
}

const ShiftControl: React.FC<Props> = ({ isShiftOpen, onOpenShift, onCloseShift }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenShift = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/cashier/shift/open", { method: "POST" });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Не удалось открыть смену.");
      }
      onOpenShift();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseShift = async () => {
    setLoading(true);
    setError(null);
    try {
      await onCloseShift();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md flex flex-col justify-center h-full">
      <h2 className="text-lg font-semibold text-gray-800 text-center">
        Управление сменой
      </h2>
      {error && <div className="text-red-500 text-xs text-center mt-2">{error}</div>}
      <div className="flex justify-center items-center gap-3 mt-2">
        <button
          onClick={handleOpenShift}
          disabled={isShiftOpen || loading}
          className="w-full px-4 py-2 rounded-md font-semibold text-white transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed bg-green-500 hover:bg-green-600 text-sm"
        >
          {loading && !isShiftOpen ? "..." : "Открыть"}
        </button>
        <button
          onClick={handleCloseShift}
          disabled={!isShiftOpen || loading}
          className="w-full px-4 py-2 rounded-md font-semibold text-white transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed bg-red-500 hover:bg-red-600 text-sm"
        >
          {loading && isShiftOpen ? "..." : "Закрыть"}
        </button>
      </div>
    </div>
  );
};

export default ShiftControl;