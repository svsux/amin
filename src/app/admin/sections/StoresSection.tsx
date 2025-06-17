import Alert from "../components/Alert";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import DangerButton from "../components/DangerButton";
import AnimatedSelect from "../components/AnimatedSelect";
import { FiEdit, FiPlus, FiArchive, FiTrash, FiSearch, FiUsers, FiPackage } from "react-icons/fi";
import React, { useState } from "react"; // Добавлен useState
import type { Store, Cashier } from "../types";
import ConfirmDialog from "../components/ConfirmDialog"; // ИМПОРТИРУЕМ ВАШ КОМПОНЕНТ

type CashierOption = { label: string; value: string };

interface Props {
  storeName: string;
  storeAddress: string;
  selectedCashiers: string[];
  stores: Store[];
  cashiers: Cashier[];
  loadingStores: boolean;
  storeMessage: { text: string | null; type: "success" | "error" } | null;
  isLoadingStoreAction: boolean;
  editStore: Store | null;
  searchTermStores: string;
  setStoreName: (v: string) => void;
  setStoreAddress: (v: string) => void;
  setSelectedCashiers: (v: string[]) => void;
  setSearchTermStores: (v: string) => void;
  handleStoreSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleEditStore: (store: Store) => void;
  handleDeleteStore: (id: string) => void; // Эта функция будет вызвана при подтверждении
  resetStoreForm: () => void;
  setStoreMessage: (v: any) => void;
}

const StoresSection: React.FC<Props> = ({
  storeName,
  storeAddress,
  selectedCashiers,
  stores,
  cashiers,
  loadingStores,
  storeMessage,
  isLoadingStoreAction,
  editStore,
  searchTermStores,
  setStoreName,
  setStoreAddress,
  setSelectedCashiers,
  setSearchTermStores,
  handleStoreSubmit,
  handleEditStore,
  handleDeleteStore, // Используем эту функцию
  resetStoreForm,
  setStoreMessage,
}) => {
  const cashierOptions: CashierOption[] = cashiers.map((c) => ({
    value: c.id,
    label: c.email,
  }));

  const handleCashierChange = (selectedOptions: readonly CashierOption[] | null) => {
    setSelectedCashiers(selectedOptions ? selectedOptions.map((o) => o.value) : []);
  };

  const customSelectStyles = {
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#6366f1" : state.isFocused ? "#e0e7ff" : "#ffffff",
      color: state.isSelected ? "#ffffff" : "#374151",
      fontWeight: state.isSelected ? 500 : 400,
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: "#e0e7ff",
      color: "#4338ca",
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: "#4338ca",
    }),
    multiValueRemove: (provided: any, state: any) => ({
      ...provided,
      color: state.isFocused ? "#4338ca" : "#6366f1",
      backgroundColor: "transparent",
      ":hover": {
        color: "#4338ca",
      },
    }),
    control: (provided: any) => ({
      ...provided,
      borderColor: "#d1d5db",
      ":hover": {
        borderColor: "#6366f1",
      },
    }),
  };

  // Состояния для диалога подтверждения
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState<Store | null>(null);

  const openConfirmDialog = (store: Store) => {
    setStoreToDelete(store);
    setIsConfirmDialogOpen(true);
  };

  const closeConfirmDialog = () => {
    setStoreToDelete(null);
    setIsConfirmDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (storeToDelete) {
      handleDeleteStore(storeToDelete.id); // Вызываем переданную функцию handleDeleteStore
    }
    closeConfirmDialog();
  };


  return (
    <section className="space-y-10">
      <div className="bg-white/80 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl p-8 transition-all">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          {editStore ? (
            <>
              <FiEdit className="text-indigo-600" /> Редактировать магазин: {editStore.name}
            </>
          ) : (
            <>
              <FiPlus className="text-indigo-600" /> Создать новый магазин
            </>
          )}
        </h2>
        {storeMessage?.text && (
             <Alert message={storeMessage.text} type={storeMessage.type || "info"} />
        )}
        <form onSubmit={handleStoreSubmit} className="space-y-5">
          <InputField
            label="Название магазина"
            id="store-name"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            required
            placeholder="Например, Продуктовый №1"
          />
          <InputField
            label="Адрес магазина"
            id="store-address"
            value={storeAddress}
            onChange={(e) => setStoreAddress(e.target.value)}
            placeholder="ул. Ленина, д. 10"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Кассиры в магазине
            </label>
            {cashiers.length === 0 ? (
              <p className="text-sm text-gray-500 mt-1">
                Сначала добавьте кассиров в разделе &quot;Кассиры&quot;.
              </p>
            ) : (
              <AnimatedSelect
                isMulti
                options={cashierOptions}
                value={cashierOptions.filter((option) =>
                  selectedCashiers.includes(option.value)
                )}
                onChange={handleCashierChange}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Выберите кассиров..."
                styles={customSelectStyles}
              />
            )}
          </div>
          <div className="flex gap-3 pt-1">
            <PrimaryButton
              type="submit"
              disabled={isLoadingStoreAction}
              className="flex-1"
            >
              {isLoadingStoreAction
                ? editStore
                  ? "Сохранение..."
                  : "Создание..."
                : editStore
                ? "Сохранить изменения"
                : "Создать магазин"}
            </PrimaryButton>
            {editStore && (
              <button
                type="button"
                onClick={() => {
                  resetStoreForm();
                  setStoreMessage(null);
                }}
                className="flex-1 py-2.5 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white/80 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl p-8 transition-all">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FiArchive className="text-indigo-600" /> Список магазинов
        </h2>
        <div className="mb-6 relative">
          <InputField
            label="Поиск по названию или адресу"
            id="search-store"
            type="search"
            value={searchTermStores}
            onChange={(e) => setSearchTermStores(e.target.value)}
            placeholder="Введите название или адрес..."
            icon={<FiSearch className="w-5 h-5 text-gray-400" />}
          />
        </div>
        {loadingStores ? (
          <p className="text-gray-600 text-center py-4">Загрузка магазинов...</p>
        ) : stores.length === 0 ? (
          <p className="text-gray-600 text-center py-4">
            Магазины не найдены или еще не созданы.
          </p>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto pr-2">
            <ul className="divide-y divide-gray-200">
              {stores.map((store) => (
                <li key={store.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                    <div className="flex-grow">
                      <h3 className="font-semibold text-lg text-gray-900">{store.name}</h3>
                      <p className="text-sm text-gray-600">
                        {store.address || "Адрес не указан"}
                      </p>
                      <div className="mt-2 text-xs space-y-1">
                        <p className="text-gray-700 flex items-center gap-1">
                          <FiUsers className="text-indigo-600 w-3.5 h-3.5" />
                          <span className="font-medium">
                            Кассиры ({store.cashiers.length}):
                          </span>{" "}
                          {store.cashiers.length > 0 ? store.cashiers.map((c) => c.cashier.email).join(", ") : "Нет"}
                        </p>
                        <p className="text-gray-700 flex items-center gap-1">
                           <FiPackage className="text-indigo-600 w-3.5 h-3.5" />
                          <span className="font-medium">
                            Товары ({store.products.length}):
                          </span>{" "}
                          {store.products.length > 0 ? store.products.map((p) => p.product.name).join(", ") : "Нет"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-4 sm:mt-0 flex-shrink-0">
                      <button
                        onClick={() => handleEditStore(store)}
                        disabled={isLoadingStoreAction}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold transition flex items-center gap-1 disabled:text-gray-400 disabled:hover:text-gray-400"
                      >
                        <FiEdit className="w-4 h-4 mr-1" />
                        Редактировать
                      </button>
                      <DangerButton
                        onClick={() => openConfirmDialog(store)} // ИЗМЕНЕНО: открываем диалог
                        disabled={isLoadingStoreAction}
                      >
                        <FiTrash className="mr-1 text-white" />
                        Удалить
                      </DangerButton>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Диалог подтверждения */}
      <ConfirmDialog
        open={isConfirmDialogOpen}
        message={`Вы уверены, что хотите удалить магазин "${storeToDelete?.name || ''}"? Это действие необратимо и удалит все связанные с ним данные.`}
        onConfirm={handleConfirmDelete}
        onCancel={closeConfirmDialog}
      />
    </section>
  );
};

export default StoresSection;