import Alert from "../components/Alert";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import AnimatedSelect from "../components/AnimatedSelect";
import { FiEdit, FiPlus, FiArchive, FiTrash, FiSearch, FiUsers, FiPackage } from "react-icons/fi";
import React, { useState } from "react";
import type { Store, Cashier } from "../types";
import ConfirmDialog from "../components/ConfirmDialog";

type CashierOption = { label: string; value: string };

interface Props {
  storeName: string;
  storeAddress: string;
  selectedCashiers: string[];
  stores: Store[];
  cashiers: Cashier[];
  loadingStores: boolean;
  storeMessage: { text: string | null; type: "success" | "error" | "info" } | null;
  isLoadingStoreAction: boolean;
  editStore: Store | null;
  searchTermStores: string;
  setStoreName: (v: string) => void;
  setStoreAddress: (v: string) => void;
  setSelectedCashiers: (v: string[]) => void;
  setSearchTermStores: (v: string) => void;
  handleStoreSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleEditStore: (store: Store) => void;
  handleDeleteStore: (id: string) => void;
  resetStoreForm: () => void;
  setStoreMessage: (v: { text: string | null; type: "success" | "error" | "info" } | null) => void;
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
  handleDeleteStore,
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
      handleDeleteStore(storeToDelete.id);
    }
    closeConfirmDialog();
  };

  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchTermStores.toLowerCase()) ||
      store.address?.toLowerCase().includes(searchTermStores.toLowerCase())
  );

  return (
    <section className="space-y-10">
      {/* Форма создания/редактирования магазина */}
      <div className="bg-[#121418]/80 backdrop-blur-md border border-[#1E2228] shadow-xl rounded-2xl p-8 transition-all">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          {editStore ? (
            <>
              <FiEdit className="text-[#0066FF]" /> Редактировать: {editStore.name}
            </>
          ) : (
            <>
              <FiPlus className="text-[#0066FF]" /> Создать новый магазин
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
            <label className="block text-sm font-medium text-[#A0A8B8] mb-1">
              Кассиры в магазине
            </label>
            {cashiers.length === 0 ? (
              <p className="text-sm text-[#A0A8B8]/70 mt-1">
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
                classNamePrefix="react-select"
                placeholder="Выберите кассиров..."
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
                className="flex-1 py-2.5 px-4 border border-[#1E2228] rounded-md shadow-sm text-sm font-semibold text-[#A0A8B8] bg-[#121418] hover:bg-[#1E2228] transition-colors"
              >
                Отмена
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Список магазинов */}
      <div className="bg-[#121418]/80 backdrop-blur-md border border-[#1E2228] shadow-xl rounded-2xl p-8 transition-all">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <FiArchive className="text-[#0066FF]" /> Список магазинов
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
          <p className="text-[#A0A8B8] text-center py-4">Загрузка магазинов...</p>
        ) : filteredStores.length === 0 ? (
          <p className="text-[#A0A8B8] text-center py-4">
            Магазины не найдены.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredStores.map((store) => (
              <div key={store.id} className="bg-[#0F1115] rounded-2xl border border-[#1E2228] p-6 flex flex-col justify-between transition-all duration-300 hover:border-[#0066FF]/60 hover:shadow-lg hover:shadow-[#0066FF]/10">
                <div>
                  <h3 className="font-bold text-xl text-white truncate">{store.name}</h3>
                  <p className="text-sm text-[#A0A8B8] mt-1 truncate">
                    {store.address || "Адрес не указан"}
                  </p>
                </div>
                <div className="my-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <FiUsers className="w-5 h-5 text-[#0066FF]" />
                    <span className="text-[#A0A8B8]">Кассиров:</span>
                    <span className="font-semibold text-white">{store.cashiers.length}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <FiPackage className="w-5 h-5 text-[#0066FF]" />
                    <span className="text-[#A0A8B8]">Товаров:</span>
                    <span className="font-semibold text-white">{store.products.length}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-[#1E2228]">
                  <button
                    onClick={() => handleEditStore(store)}
                    disabled={isLoadingStoreAction}
                    className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0066FF]/10 border border-transparent rounded-md hover:bg-[#0066FF]/20 transition-colors disabled:opacity-50"
                  >
                    <FiEdit />
                    Редактировать
                  </button>
                  <button
                    onClick={() => openConfirmDialog(store)}
                    disabled={isLoadingStoreAction}
                    className="p-2 text-[#FF3B30] hover:bg-[#FF3B30]/20 rounded-md transition-colors disabled:opacity-50"
                    title="Удалить магазин"
                  >
                    <FiTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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