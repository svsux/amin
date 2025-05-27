import { useState, useEffect } from "react";
import InputField from "./InputField";
import PrimaryButton from "./PrimaryButton";

interface Cashier {
  id: string;
  email: string;
}

export default function CashierEditModal({
  cashier,
  open,
  onClose,
  onSave,
  isLoading,
}: {
  cashier: Cashier | null;
  open: boolean;
  onClose: () => void;
  onSave: (updated: { email: string; password?: string }) => void;
  isLoading: boolean;
}) {
  const [editedEmail, setEditedEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (open && cashier) {
      setEditedEmail(cashier.email);
      setNewPassword("");
    }
  }, [cashier, open]);

  if (!open || !cashier) return null;

  const handleSaveClick = () => {
    if (!editedEmail.trim()) {
      alert("Email не может быть пустым.");
      return;
    }
    onSave({ email: editedEmail, password: newPassword || undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl"
          onClick={onClose}
          aria-label="Закрыть"
        >
          ×
        </button>
        <h3 className="text-lg font-semibold mb-4 text-indigo-700">Редактировать кассира</h3>
        <div className="space-y-4">
          <InputField
            label="Email"
            id="edit-cashier-email"
            type="email"
            value={editedEmail}
            onChange={(e: any) => setEditedEmail(e.target.value)}
            required
          />
          <InputField
            label="Новый пароль (необязательно)"
            id="edit-cashier-password"
            type="password"
            value={newPassword}
            onChange={(e: any) => setNewPassword(e.target.value)}
            minLength={6}
            placeholder="Оставьте пустым, чтобы не менять"
          />
        </div>
        <div className="flex gap-2 mt-6">
          <PrimaryButton
            type="button"
            onClick={handleSaveClick}
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? "Сохранение..." : "Сохранить"}
          </PrimaryButton>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}