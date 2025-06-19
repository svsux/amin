"use client";

import React, { useState, useEffect, FormEvent } from "react";
import Alert from "../components/Alert";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import AnimatedSelect from "../components/AnimatedSelect";
import ConfirmDialog from "../components/ConfirmDialog";
import { FiEdit, FiPlus, FiArchive, FiTrash, FiSearch, FiUsers, FiPackage } from "react-icons/fi";
import type { Store, Cashier, AlertMessage, Option } from "../types";

export default function StoresSection() {
  // --- Состояния, перенесенные из page.tsx ---
  const [stores, setStores] = useState<Store[]>([]);
  const [cashiers, setCashiers] = useState<Cashier[]>([]); // Для селекта
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<AlertMessage | null>(null);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Состояние формы
  const [editStore, setEditStore] = useState<Store | null>(null);
  const [storeName, setStoreName] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [selectedCashiers, setSelectedCashiers] = useState<string[]>([]);
  
  const [storeToDelete, setStoreToDelete] = useState<Store | null>(null);

  // --- Загрузка данных ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const [storesRes, cashiersRes] = await Promise.all([
        fetch("/api/admin/stores"),
        fetch("/api/admin/cashiers"),
      ]);
      if (!storesRes.ok || !cashiersRes.ok) throw new Error("Ошибка загрузки данных");
      
      const storesData = await storesRes.json();
      const cashiersData = await cashiersRes.json();
      
      setStores(storesData.stores || []);
      setCashiers(cashiersData.cashiers || []);
    } catch (err) {
      setMessage({ text: (err as Error).message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Логика (Handlers), перенесенная из page.tsx ---
  const resetForm = () => {
    setEditStore(null);
    setStoreName("");
    setStoreAddress("");
    setSelectedCashiers([]);
  };

  const handleEditClick = (store: Store) => {
    setEditStore(store);
    setStoreName(store.name);
    setStoreAddress(store.address || "");
    // Важно: используем `store.cashiers`, который содержит объекты-связки
    setSelectedCashiers(store.cashiers.map(c => c.cashier.id));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoadingAction(true);
    setMessage(null);

    try {
      // Логика редактирования
      if (editStore) {
        const detailsChanged = storeName !== editStore.name || storeAddress !== (editStore.address || "");
        const originalCashierIds = editStore.cashiers.map(c => c.cashier.id).sort();
        const cashiersChanged = JSON.stringify(selectedCashiers.sort()) !== JSON.stringify(originalCashierIds);

        if (!detailsChanged && !cashiersChanged) {
          setMessage({ text: "Нет изменений для сохранения.", type: "info" });
          return;
        }

        const promises = [];
        if (detailsChanged) {
          promises.push(fetch(`/api/admin/stores/${editStore.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: storeName, address: storeAddress }),
          }));
        }
        if (cashiersChanged) {
          promises.push(fetch(`/api/admin/stores/${editStore.id}/cashiers`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cashierIds: selectedCashiers }),
          }));
        }
        
        const responses = await Promise.all(promises);
        for (const res of responses) {
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || "Ошибка при обновлении");
          }
        }
        setMessage({ text: "Магазин успешно обновлен!", type: "success" });
      } 
      // Логика создания
      else {
        const res = await fetch("/api/admin/stores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: storeName, address: storeAddress, cashierIds: selectedCashiers }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setMessage({ text: "Магазин успешно создан!", type: "success" });
      }
      
      resetForm();
      fetchData(); // Обновляем список
    } catch (err) {
      setMessage({ text: (err as Error).message, type: "error" });
    } finally {
      setIsLoadingAction(false);
    }
  };

  const executeDeleteStore = async () => {
    if (!storeToDelete) return;
    setIsLoadingAction(true);
    try {
      const res = await fetch(`/api/admin/stores/${storeToDelete.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }
      setMessage({ text: "Магазин успешно удален.", type: "success" });
      fetchData(); // Обновляем список
    } catch (err) {
      setMessage({ text: (err as Error).message, type: "error" });
    } finally {
      setIsLoadingAction(false);
      setStoreToDelete(null);
    }
  };

  const cashierOptions: Option[] = cashiers.map((c) => ({ value: c.id, label: c.email }));
  const filteredStores = stores.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <>
      <section className="space-y-10">
        {/* Форма */}
        <div className="bg-[#121418]/80 backdrop-blur-md border border-[#1E2228] shadow-xl rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            {editStore ? <><FiEdit /> Редактировать магазин</> : <><FiPlus /> Создать магазин</>}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField label="Название магазина" id="store-name" value={storeName} onChange={(e) => setStoreName(e.target.value)} required />
            <InputField label="Адрес магазина" id="store-address" value={storeAddress} onChange={(e) => setStoreAddress(e.target.value)} />
            <AnimatedSelect isMulti options={cashierOptions} value={cashierOptions.filter(o => selectedCashiers.includes(o.value))} onChange={(opts) => setSelectedCashiers(opts ? opts.map(o => o.value) : [])} placeholder="Выберите кассиров..." />
            <div className="flex gap-3 pt-1">
              <PrimaryButton type="submit" disabled={isLoadingAction} className="flex-1">
                {isLoadingAction ? (editStore ? 'Сохранение...' : 'Создание...') : (editStore ? "Сохранить" : "Создать")}
              </PrimaryButton>
              {editStore && <button type="button" onClick={resetForm} className="flex-1 bg-gray-500/10 hover:bg-gray-500/20 border border-[#1E2228] rounded-md text-white">Отмена</button>}
            </div>
          </form>
        </div>

        {/* Список */}
        <div className="bg-[#121418]/80 backdrop-blur-md border border-[#1E2228] shadow-xl rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><FiArchive className="text-[#0066FF]" /> Список магазинов</h2>
          <InputField label="Поиск по названию" id="search-store" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} icon={<FiSearch />} />
          {loading ? <p className="text-center py-4">Загрузка...</p> : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
              {filteredStores.map(store => (
                <div key={store.id} className="bg-[#0F1115] rounded-2xl border border-[#1E2228] p-6 flex flex-col">
                  <h3 className="font-bold text-xl text-white truncate">{store.name}</h3>
                  <p className="text-sm text-[#A0A8B8] mt-1 truncate">{store.address || "Адрес не указан"}</p>
                  <div className="my-6 space-y-3">
                    <div className="flex items-center gap-3 text-sm"><FiUsers className="text-gray-400" /> Кассиров: <span className="font-semibold text-white">{store.cashiers.length}</span></div>
                    <div className="flex items-center gap-3 text-sm"><FiPackage className="text-gray-400" /> Товаров: <span className="font-semibold text-white">{store.products.length}</span></div>
                  </div>
                  <div className="flex items-center gap-3 pt-4 mt-auto border-t border-[#1E2228]">
                    <button onClick={() => handleEditClick(store)} className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0066FF]/10 rounded-md hover:bg-[#0066FF]/20"><FiEdit /> Редактировать</button>
                    <button onClick={() => setStoreToDelete(store)} className="p-2 text-[#FF3B30] hover:bg-[#FF3B30]/20 rounded-md"><FiTrash /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      
      {message?.text && <Alert message={message.text} type={message.type} onClose={() => setMessage(null)} />}
      <ConfirmDialog open={!!storeToDelete} message={`Удалить магазин "${storeToDelete?.name}"?`} onConfirm={executeDeleteStore} onCancel={() => setStoreToDelete(null)} />
    </>
  );
}