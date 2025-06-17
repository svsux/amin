import Alert from "../components/Alert";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import DangerButton from "../components/DangerButton";
import { FiUsers, FiEdit, FiTrash, FiPlus, FiSearch } from "react-icons/fi";
import type { Cashier } from "../types";
import React from "react";

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
  <section className="space-y-10">
    {/* Блок создания */}
    <div className="bg-white/80 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl p-8 transition-all">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <FiPlus className="text-indigo-600" /> {/* ИЗМЕНЕНО */}
        Новый кассир
      </h2>

      {cashierMessage && (
        <Alert message={cashierMessage.text} type={cashierMessage.type || "info"} />
      )}

      <form onSubmit={handleCreateCashier} className="grid gap-5 sm:grid-cols-2">
        <InputField
          label="Email"
          id="email-cashier"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="example@club.kg"
        />
        <InputField
          label="Пароль"
          id="password-cashier"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          placeholder="не менее 6 символов"
        />
        <div className="sm:col-span-2">
          <PrimaryButton type="submit" disabled={isLoadingCashierAction}>
            {isLoadingCashierAction ? "Создание..." : "Создать кассира"}
          </PrimaryButton>
        </div>
      </form>
    </div>

    {/* Поиск и список */}
    <div className="bg-white/80 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl p-8 transition-all">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <FiUsers className="text-indigo-600" /> {/* ИЗМЕНЕНО */}
        Список кассиров
      </h2>

      <div className="mb-6">
        <InputField
          label="Поиск по Email"
          id="search-cashier"
          type="search"
          value={searchTermCashiers}
          onChange={(e) => setSearchTermCashiers(e.target.value)}
          placeholder="Поиск..."
          icon={<FiSearch className="w-5 h-5 text-gray-400" />}
        />
      </div>

      {loadingCashiers ? (
        <p className="text-center text-gray-500 py-6">Загрузка кассиров...</p>
      ) : cashiers.length === 0 ? (
        <p className="text-center text-gray-500 py-6">Нет зарегистрированных кассиров.</p>
      ) : (
        <div className="max-h-[60vh] overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cashiers.map((cashier) => (
            <div
              key={cashier.id}
              className="bg-white rounded-xl border border-gray-200 shadow hover:shadow-md p-5 flex flex-col justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <FiUsers className="text-indigo-600 w-6 h-6 shrink-0" /> {/* ИЗМЕНЕНО */}
                <span className="text-gray-900 font-medium break-all">{cashier.email}</span>
              </div>

              <div className="flex gap-3 mt-4">
                <PrimaryButton
                  type="button"
                  onClick={() => openEditCashierModal(cashier)}
                  disabled={isLoadingCashierAction}
                  className="flex-1"
                >
                  <FiEdit className="mr-1 text-white" /> {/* ИЗМЕНЕНО, добавлен mr-1 для отступа */}
                  Редакт.
                </PrimaryButton>
                <DangerButton
                  onClick={() => handleDeleteCashier(cashier.id)}
                  disabled={isLoadingCashierAction}
                  className="flex-1"
                >
                  <FiTrash className="mr-1 text-white" /> {/* ИЗМЕНЕНО, добавлен mr-1 для отступа */}
                  Удалить
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
