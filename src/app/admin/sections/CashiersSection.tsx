import Alert from "../components/Alert";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import DangerButton from "../components/DangerButton";
import { FiUsers, FiEdit, FiTrash, FiPlus, FiSearch } from "react-icons/fi";
import React from "react";
import type { Cashier } from "../types"; // Импорт типа из types.ts

interface Props {
  email: string;
  password: string;
  cashiers: Cashier[];
  loadingCashiers: boolean;
  cashierMessage: { text: string | null; type: "success" | "error" } | null;
  isLoadingCashierAction: boolean;
  searchTermCashiers: string;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  setSearchTermCashiers: (v: string) => void;
  handleCreateCashier: (e: React.FormEvent<HTMLFormElement>) => void;
  openEditCashierModal: (cashier: Cashier) => void;
  handleDeleteCashier: (id: string) => void;
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
  openEditCashierModal,
  handleDeleteCashier,
}) => (
  <section className="space-y-6">
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"><FiPlus /> Создать нового кассира</h2>
      <Alert message={cashierMessage?.text ?? null} type={cashierMessage?.type || "info"} />
      <form onSubmit={handleCreateCashier} className="space-y-4">
        <InputField label="Email кассира" id="email-cashier" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="cashier@example.com" />
        <InputField label="Пароль кассира" id="password-cashier" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="Минимум 6 символов" />
        <PrimaryButton type="submit" disabled={isLoadingCashierAction}>
          {isLoadingCashierAction ? "Создание..." : "Создать кассира"}
        </PrimaryButton>
      </form>
    </div>
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <FiUsers /> Список кассиров
      </h2>
      <div className="mb-4 relative">
        <InputField
          label="Поиск по Email"
          id="search-cashier"
          type="search"
          value={searchTermCashiers}
          onChange={e => setSearchTermCashiers(e.target.value)}
          placeholder="Поиск по Email..."
        />
        <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 mt-0.5 text-gray-400" />
      </div>
      {loadingCashiers ? (
        <p className="text-gray-600 text-center py-4">Загрузка кассиров...</p>
      ) : cashiers.length === 0 ? (
        <p className="text-gray-600 text-center py-4">Кассиры не найдены или еще не созданы.</p>
      ) : (
        <div className="max-h-[400px] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-gray-200">
          {cashiers.map((cashier) => (
            <div
              key={cashier.id}
              className="bg-gray-50 rounded-lg shadow p-4 flex flex-col gap-2 border border-gray-200 hover:shadow-md transition"
            >
              <div className="flex items-center gap-3">
                <FiUsers className="text-indigo-500 w-6 h-6" />
                <span className="font-medium text-gray-900 break-all">{cashier.email}</span>
              </div>
              <div className="flex gap-2 mt-2">
                <PrimaryButton
                  type="button"
                  onClick={() => openEditCashierModal(cashier)}
                  disabled={isLoadingCashierAction}
                  className="flex-1"
                >
                  <FiEdit /> Редактировать
                </PrimaryButton>
                <DangerButton
                  onClick={() => handleDeleteCashier(cashier.id)}
                  disabled={isLoadingCashierAction}
                  className="flex-1"
                >
                  <FiTrash /> Удалить
                </DangerButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </section>
);

export default CashiersSection;