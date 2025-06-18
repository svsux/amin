import { useState, useEffect } from "react";
import InputField from "./InputField";
import PrimaryButton from "./PrimaryButton";
import { motion } from "framer-motion";

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
      // Можно заменить на более красивое уведомление в будущем
      alert("Email не может быть пустым.");
      return;
    }
    onSave({ email: editedEmail, password: newPassword || undefined });
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="bg-[#121418] rounded-lg shadow-xl p-6 w-full max-w-md relative border border-[#1E2228]"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
      >
        <button
          className="absolute top-3 right-3 text-[#A0A8B8] hover:text-white text-2xl transition-colors"
          onClick={onClose}
          aria-label="Закрыть"
        >
          &times;
        </button>
        <h3 className="text-lg font-semibold mb-4 text-white">Редактировать кассира</h3>
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
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 px-4 border border-[#1E2228] rounded-md shadow-sm text-sm font-semibold text-[#A0A8B8] hover:bg-[#1E2228] transition-colors disabled:opacity-50"
          >
            Отмена
          </button>
          <PrimaryButton
            type="button"
            onClick={handleSaveClick}
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? "Сохранение..." : "Сохранить"}
          </PrimaryButton>
        </div>
      </motion.div>
    </motion.div>
  );
}