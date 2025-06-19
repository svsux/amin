"use client";

import React, { useState, useEffect, FormEvent } from "react";
import Alert from "../components/Alert";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import ConfirmDialog from "../components/ConfirmDialog";
import CashierEditModal from "../components/CashierEditModal";
import { FiPlus, FiUsers, FiSearch, FiEdit, FiTrash, FiHome } from "react-icons/fi";
import type { Cashier, AlertMessage } from "../types";

export default function CashiersSection() {
  // --- Состояния, перенесенные из page.tsx ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cashiers, setCashiers] = useState<Cashier[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<AlertMessage | null>(null);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCashier, setEditingCashier] = useState<Cashier | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [cashierToDelete, setCashierToDelete] = useState<Cashier | null>(null);

  // --- Загрузка данных ---
  const fetchCashiers = async () => {
    setLoading(true);
    try {
      // ИЗМЕНЕНО: Добавлена опция { cache: "no-store" } для отключения кэширования
      const res = await fetch("/api/admin/cashiers", { cache: "no-store" });
      if (!res.ok) throw new Error("Не удалось загрузить кассиров");
      const data = await res.json();
      setCashiers(data.cashiers || []);
    } catch (err) {
      setMessage({ text: (err as Error).message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCashiers();
  }, []);

  // --- Логика (Handlers), перенесенная из page.tsx ---
  const handleCreateCashier = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoadingAction(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: "CASHIER" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage({ text: "Кассир успешно создан!", type: "success" });
      setEmail("");
      setPassword("");
      fetchCashiers(); // Обновляем список
    } catch (err) {
      setMessage({ text: (err as Error).message, type: "error" });
    } finally {
      setIsLoadingAction(false);
    }
  };

  const executeDeleteCashier = async () => {
    if (!cashierToDelete) return;
    setIsLoadingAction(true);
    try {
      const res = await fetch(`/api/admin/cashiers/${cashierToDelete.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }
      setMessage({ text: "Кассир успешно удален.", type: "success" });
      fetchCashiers(); // Обновляем список
    } catch (err) {
      setMessage({ text: (err as Error).message, type: "error" });
    } finally {
      setIsLoadingAction(false);
      setCashierToDelete(null);
    }
  };

  const handleSaveCashier = async (updatedCashier: Cashier) => {
    setIsLoadingAction(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/cashiers/${updatedCashier.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCashier),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage({ text: "Данные кассира обновлены.", type: "success" });
      setIsEditModalOpen(false);
      
      // ИЗМЕНЕНО: Добавлено ключевое слово 'await'
      await fetchCashiers(); // Дожидаемся полного обновления списка

    } catch (err) {
      setMessage({ text: (err as Error).message, type: "error" });
    } finally {
      setIsLoadingAction(false);
    }
  };

  const filteredCashiers = cashiers.filter((c) =>
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <section className="space-y-10">
        {/* Форма создания */}
        <div className="bg-[#121418]/80 backdrop-blur-md border border-[#1E2228] shadow-xl rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <FiPlus className="text-[#0066FF]" /> Добавить нового кассира
          </h2>
          <form onSubmit={handleCreateCashier} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField label="Email кассира" id="cashier-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <InputField label="Пароль" id="cashier-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <PrimaryButton type="submit" disabled={isLoadingAction} className="w-full">
              {isLoadingAction ? "Создание..." : "Создать кассира"}
            </PrimaryButton>
          </form>
        </div>

        {/* Список кассиров */}
        <div className="bg-[#121418]/80 backdrop-blur-md border border-[#1E2228] shadow-xl rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <FiUsers className="text-[#0066FF]" /> Список кассиров
          </h2>
          <InputField label="Поиск по Email" id="search-cashier" type="search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} icon={<FiSearch />} />

          {loading ? <p className="text-center py-4">Загрузка...</p> : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
              {filteredCashiers.map((cashier) => (
                <div key={cashier.id} className="bg-[#0F1115] rounded-2xl border border-[#1E2228] p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-white truncate">{cashier.email}</h3>
                    <div className="flex items-center gap-3 text-sm mt-4">
                      <FiHome className="w-5 h-5 text-[#0066FF]" />
                      <span className="text-[#A0A8B8]">Назначен в магазины:</span>
                      <span className="font-semibold text-white">{cashier.storeCashiers?.length || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-4 mt-6 border-t border-[#1E2228]">
                    <button onClick={() => { setEditingCashier(cashier); setIsEditModalOpen(true); }} className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0066FF]/10 rounded-md hover:bg-[#0066FF]/20">
                      <FiEdit /> Изменить
                    </button>
                    <button onClick={() => setCashierToDelete(cashier)} className="p-2 text-[#FF3B30] hover:bg-[#FF3B30]/20 rounded-md">
                      <FiTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Модальные окна */}
      {message?.text && <Alert message={message.text} type={message.type} onClose={() => setMessage(null)} />}
      <CashierEditModal cashier={editingCashier} open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleSaveCashier} isLoading={isLoadingAction} />
      <ConfirmDialog open={!!cashierToDelete} message={`Удалить кассира ${cashierToDelete?.email}?`} onConfirm={executeDeleteCashier} onCancel={() => setCashierToDelete(null)} />
    </>
  );
}
