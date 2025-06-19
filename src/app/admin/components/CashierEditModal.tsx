"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import InputField from "./InputField";
import PrimaryButton from "./PrimaryButton";
import type { Cashier } from "../types";

interface Props {
  open: boolean;
  cashier: Cashier | null;
  onClose: () => void;
  onSave: (data: { id: string; email: string; password?: string }) => void;
  isLoading: boolean;
}

export default function CashierEditModal({
  open,
  cashier,
  onClose,
  onSave,
  isLoading,
}: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (cashier) {
      setEmail(cashier.email);
      setPassword("");
    }
  }, [cashier]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!cashier) return;
    onSave({
      id: cashier.id,
      email: email,
      password: password,
    });
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 30, scale: 0.95 },
  };

  return (
    <AnimatePresence>
      {open && cashier && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-[#121418] border border-[#1E2228] rounded-2xl shadow-xl w-full max-w-md p-8 relative"
            variants={modalVariants}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <FiX size={24} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">
              Редактировать кассира
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <InputField
                label="Email кассира"
                id="edit-cashier-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <InputField
                label="Новый пароль (оставьте пустым, чтобы не менять)"
                id="edit-cashier-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <PrimaryButton type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Сохранение..." : "Сохранить изменения"}
              </PrimaryButton>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}