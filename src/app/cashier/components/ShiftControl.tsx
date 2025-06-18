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
    <div className="bg-indigo-700 rounded-2xl px-4 py-3 flex flex-col items-center w-full max-w-[260px]">
      <h2 className="text-base font-bold text-white text-center mb-2">
        Управление сменой
      </h2>

      {error && <div className="text-red-200 text-xs text-center mb-2">{error}</div>}

      <div className="flex gap-2 w-full justify-center">
        <button
          onClick={handleOpenShift}
          disabled={isShiftOpen || loading}
          className="flex-1 py-1.5 px-3 rounded-md text-white text-sm font-semibold transition disabled:bg-indigo-900 disabled:cursor-not-allowed bg-green-600 hover:bg-green-700"
        >
          {loading && !isShiftOpen ? "..." : "Открыть"}
        </button>
        <button
          onClick={handleCloseShift}
          disabled={!isShiftOpen || loading}
          className="flex-1 py-1.5 px-3 rounded-md text-white text-sm font-semibold transition disabled:bg-indigo-900 disabled:cursor-not-allowed bg-indigo-900 hover:bg-indigo-800"
        >
          {loading && isShiftOpen ? "..." : "Закрыть"}
        </button>
      </div>
    </div>
  );
};

export default ShiftControl;
