import Alert from "../components/Alert";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import DangerButton from "../components/DangerButton";
import { FiEdit, FiPlus, FiArchive, FiTrash, FiSearch } from "react-icons/fi";
import React from "react";
import type { Store, Cashier } from "../types"; // Импортируем типы из types.ts

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
  handleDeleteStore: (id: string) => void;
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
  handleDeleteStore,
  resetStoreForm,
  setStoreMessage,
}) => (
  <section className="space-y-6">
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        {editStore ? <><FiEdit /> Редактировать магазин: {editStore.name}</> : <><FiPlus /> Создать новый магазин</>}
      </h2>
      <Alert message={storeMessage?.text ?? null} type={storeMessage?.type || "info"} />
      <form onSubmit={handleStoreSubmit} className="space-y-4">
        <InputField label="Название магазина" id="store-name" value={storeName} onChange={e => setStoreName(e.target.value)} required placeholder="Например, Продуктовый №1" />
        <InputField label="Адрес магазина" id="store-address" value={storeAddress} onChange={e => setStoreAddress(e.target.value)} placeholder="ул. Ленина, д. 10" />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Кассиры в магазине</label>
          {cashiers.length === 0 ? <p className="text-sm text-gray-500">Сначала добавьте кассиров.</p> :
            <select multiple value={selectedCashiers} onChange={e => setSelectedCashiers(Array.from(e.target.selectedOptions, o => o.value))} className="mt-1 block w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              {cashiers.map(c => (<option key={c.id} value={c.id}>{c.email}</option>))}
            </select>}
          <p className="text-xs text-gray-500 mt-1">Удерживайте Ctrl (или Cmd на Mac) для выбора нескольких.</p>
        </div>
        <div className="flex gap-2">
          <PrimaryButton type="submit" disabled={isLoadingStoreAction} className="flex-1">
            {isLoadingStoreAction ? (editStore ? "Сохранение..." : "Создание...") : (editStore ? "Сохранить изменения" : "Создать магазин")}
          </PrimaryButton>
          {editStore && (
            <button type="button" onClick={() => { resetStoreForm(); setStoreMessage(null); }} className="flex-1 py-2.5 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              Отмена
            </button>
          )}
        </div>
      </form>
    </div>
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"><FiArchive /> Список магазинов</h2>
      <div className="mb-4 relative">
        <InputField
          label="Поиск по названию магазина"
          id="search-store"
          type="search"
          value={searchTermStores}
          onChange={e => setSearchTermStores(e.target.value)}
          placeholder="Поиск по названию магазина..."
        />
        <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 mt-0.5 text-gray-400" />
      </div>
      {loadingStores ? (
        <p className="text-gray-600 text-center py-4">Загрузка магазинов...</p>
      ) : stores.length === 0 ? (
        <p className="text-gray-600 text-center py-4">Магазины не найдены или еще не созданы.</p>
      ) : (
        <div className="max-h-[700px] overflow-y-auto border border-gray-200 rounded-md">
          <ul className="divide-y divide-gray-200">
            {stores.map((store) => (
              <li key={store.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{store.name}</h3>
                    <p className="text-sm text-gray-600">{store.address || "Адрес не указан"}</p>
                    <div className="mt-2 text-xs">
                      <p className="text-gray-700"><span className="font-medium">Кассиры ({store.cashiers.length}):</span> {store.cashiers.map(c => c.cashier.email).join(", ") || "Нет"}</p>
                      <p className="text-gray-700"><span className="font-medium">Товары ({store.products.length}):</span> {store.products.map(p => p.product.name).join(", ") || "Нет"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-3 sm:mt-0 flex-shrink-0">
                    <button onClick={() => handleEditStore(store)} disabled={isLoadingStoreAction} className="text-blue-600 hover:text-blue-800 font-semibold transition flex items-center gap-1 disabled:text-gray-400">
                      <FiEdit /> Редактировать
                    </button>
                    <DangerButton onClick={() => handleDeleteStore(store.id)} disabled={isLoadingStoreAction}>
                      <FiTrash /> Удалить
                    </DangerButton>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </section>
);

export default StoresSection;