"use client";

import React from "react";
import Alert from "../components/Alert";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import { FiUser, FiPlus, FiUsers, FiSearch, FiEdit, FiTrash, FiHome } from "react-icons/fi";
import type { Cashier } from "../types";

interface Props {
  email: string;
  password: string;
  cashiers: Cashier[];
  loadingCashiers: boolean;
  cashierMessage: { text: string | null; type: "success" | "error" | "info" } | null;
  isLoadingCashierAction: boolean;
  searchTermCashiers: string;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  setSearchTermCashiers: (v: string) => void;
  handleCreateCashier: (e: React.FormEvent<HTMLFormElement>) => void;
  handleDeleteCashier: (id: string) => void; // Исправьте тип здесь!
  openEditCashierModal: (cashier: Cashier) => void;
}

const CashiersSection: React.FC<Props> = ({
  email,
  password,
  cashiers,
  loadingCashiers,
  cashierMessage,
  isLoadingCashierAction,
  searchTermCashiers,
  setEmail,
  setPassword,
  setSearchTermCashiers,
  handleCreateCashier,
  handleDeleteCashier,
  openEditCashierModal,
}) => {
  const filteredCashiers = cashiers.filter((cashier) =>
    cashier.email.toLowerCase().includes(searchTermCashiers.toLowerCase())
  );

  return (
    <section className="space-y-10">
      {/* Форма создания кассира */}
      <div className="bg-[#121418]/80 backdrop-blur-md border border-[#1E2228] shadow-xl rounded-2xl p-8 transition-all">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <FiPlus className="text-[#0066FF]" />
          Добавить нового кассира
        </h2>
        {cashierMessage?.text && (
          <Alert message={cashierMessage.text} type={cashierMessage.type || "info"} />
        )}
        <form onSubmit={handleCreateCashier} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputField
              label="Email кассира"
              id="cashier-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="kassir@example.com"
            />
            <InputField
              label="Пароль"
              id="cashier-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          <div className="pt-1">
            <PrimaryButton
              type="submit"
              disabled={isLoadingCashierAction}
              className="w-full"
            >
              {isLoadingCashierAction ? "Создание..." : "Создать кассира"}
            </PrimaryButton>
          </div>
        </form>
      </div>

      {/* Список кассиров */}
      <div className="bg-[#121418]/80 backdrop-blur-md border border-[#1E2228] shadow-xl rounded-2xl p-8 transition-all">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <FiUsers className="text-[#0066FF]" />
          Список кассиров
        </h2>
        <div className="mb-6 relative">
          <InputField
            label="Поиск по Email"
            id="search-cashier"
            type="search"
            value={searchTermCashiers}
            onChange={(e) => setSearchTermCashiers(e.target.value)}
            placeholder="Введите email..."
            icon={<FiSearch className="w-5 h-5 text-gray-400" />}
          />
        </div>
        {loadingCashiers ? (
          <p className="text-[#A0A8B8] text-center py-4">Загрузка кассиров...</p>
        ) : filteredCashiers.length === 0 ? (
          <p className="text-[#A0A8B8] text-center py-4">
            Кассиры не найдены.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCashiers.map((cashier) => (
              <div key={cashier.id} className="bg-[#0F1115] rounded-2xl border border-[#1E2228] p-6 flex flex-col justify-between transition-all duration-300 hover:border-[#0066FF]/60 hover:shadow-lg hover:shadow-[#0066FF]/10">
                <div>
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 bg-[#0066FF]/10 p-3 rounded-full">
                      <FiUser className="w-6 h-6 text-[#0066FF]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-white truncate">{cashier.email}</h3>
                      <p className="text-sm text-[#A0A8B8]">
                        ID: <span className="font-mono text-xs truncate block">{cashier.id}</span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <FiHome className="w-5 h-5 text-[#0066FF]" />
                      <span className="text-[#A0A8B8]">Назначен в магазины:</span>
                      {/* ИСПРАВЛЕНО: Используем правильное поле 'storeCashiers' */}
                      <span className="font-semibold text-white">{cashier.storeCashiers?.length || 0}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-4 mt-6 border-t border-[#1E2228]">
                  <button
                    onClick={() => openEditCashierModal(cashier)}
                    disabled={isLoadingCashierAction}
                    className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0066FF]/10 border border-transparent rounded-md hover:bg-[#0066FF]/20 transition-colors disabled:opacity-50"
                  >
                    <FiEdit />
                    Изменить
                  </button>
                  <button
                    onClick={() => handleDeleteCashier(cashier.id)}
                    disabled={isLoadingCashierAction}
                    className="p-2 text-[#FF3B30] hover:bg-[#FF3B30]/20 rounded-md transition-colors disabled:opacity-50"
                    title="Удалить кассира"
                  >
                    <FiTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CashiersSection;
