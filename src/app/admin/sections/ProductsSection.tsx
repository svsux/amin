"use client";

import React, { useState, useEffect, FormEvent } from "react";
import Alert from "../components/Alert";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import ConfirmDialog from "../components/ConfirmDialog";
import ProductEditModal from "../components/ProductEditModal";
import AnimatedSelect from "../components/AnimatedSelect";
import { FiPlus, FiPackage, FiSearch, FiEdit, FiTrash } from "react-icons/fi";
import type { Product, AlertMessage, Store, Option } from "../types";

export default function ProductsSection() {
  // --- Состояния ---
  const [products, setProducts] = useState<Product[]>([]);
  const [allStores, setAllStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<AlertMessage | null>(null);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [name, setName] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // --- ИЗМЕНЕНО: Загрузка данных теперь включает и магазины ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, storesRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/stores"),
      ]);
      if (!productsRes.ok || !storesRes.ok) throw new Error("Не удалось загрузить данные");
      
      const productsData = await productsRes.json();
      const storesData = await storesRes.json();

      setProducts(productsData.products || []);
      setAllStores(storesData.stores || []);
    } catch (err) {
      setMessage({ text: (err as Error).message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Логика ---
  const resetCreateForm = () => {
    setName("");
    setPurchasePrice("");
    setSalePrice("");
    setQuantity("");
    setImageFile(null);
    setSelectedStores([]);
    // Сброс значения в поле файла
    const fileInput = document.getElementById('product-image-file') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // --- ИЗМЕНЕНО: Логика создания теперь работает с FormData ---
  const handleCreateProduct = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedStores.length === 0) {
      setMessage({ text: "Выберите хотя бы один магазин.", type: "error" });
      return;
    }
    setIsLoadingAction(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("purchasePrice", purchasePrice);
    formData.append("salePrice", salePrice);
    formData.append("quantity", quantity);
    formData.append("stores", JSON.stringify(selectedStores));
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        body: formData, // Отправляем FormData, Content-Type не указываем!
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Ошибка при создании товара.");
      
      setMessage({ text: "Товар успешно создан и привязан к магазинам!", type: "success" });
      resetCreateForm();
      fetchData(); // Обновляем список
    } catch (err) {
      setMessage({ text: (err as Error).message, type: "error" });
    } finally {
      setIsLoadingAction(false);
    }
  };

  const executeDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsLoadingAction(true);
    try {
      const res = await fetch(`/api/admin/products/${productToDelete.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }
      setMessage({ text: "Товар успешно удален.", type: "success" });
      fetchData(); // Обновляем список
    } catch (err) {
      setMessage({ text: (err as Error).message, type: "error" });
    } finally {
      setIsLoadingAction(false);
      setProductToDelete(null);
    }
  };

  // --- ИЗМЕНЕНО: Логика сохранения теперь отправляет FormData и обновляет все за один запрос ---
  const handleSaveProductEdit = async (productId: string, formData: FormData) => {
    if (!editingProduct) return;
    setIsLoadingAction(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        body: formData, // Отправляем FormData, заголовок Content-Type установится автоматически
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Не удалось обновить товар.');
      }

      setMessage({ text: 'Товар успешно обновлен!', type: 'success' });
      setIsEditModalOpen(false);
      fetchData(); // Обновляем список
    } catch (error) {
      setMessage({ text: (error as Error).message, type: 'error' });
    } finally {
      setIsLoadingAction(false);
    }
  };

  const storeOptions: Option[] = allStores.map(s => ({ value: s.id, label: s.name }));
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <section className="space-y-10">
        {/* Форма создания */}
        <div className="bg-[#121418]/80 backdrop-blur-md border border-[#1E2228] shadow-xl rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <FiPlus className="text-[#0066FF]" /> Добавить новый товар
          </h2>
          <form onSubmit={handleCreateProduct} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField label="Название товара" id="product-name" value={name} onChange={(e) => setName(e.target.value)} required />
              <InputField label="Количество" id="product-quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
              <InputField label="Цена закупки" id="product-purchase-price" type="number" step="0.01" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} required />
              <InputField label="Цена продажи" id="product-sale-price" type="number" step="0.01" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} required />
            </div>
            {/* --- ДОБАВЛЕНО: Поля для магазинов и изображения --- */}
            <AnimatedSelect isMulti options={storeOptions} value={storeOptions.filter(o => selectedStores.includes(o.value))} onChange={(opts) => setSelectedStores(opts ? opts.map(o => o.value) : [])} placeholder="Выберите магазины для привязки..." />
            <div className="flex flex-col gap-2">
                <label htmlFor="product-image-file" className="text-sm font-medium text-gray-300">Изображение товара</label>
                <input id="product-image-file" type="file" onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#0066FF]/10 file:text-[#0066FF] hover:file:bg-[#0066FF]/20 text-gray-400"/>
            </div>
            <PrimaryButton type="submit" disabled={isLoadingAction} className="w-full">
              {isLoadingAction ? "Создание..." : "Создать товар"}
            </PrimaryButton>
          </form>
        </div>

        {/* Список товаров */}
        <div className="bg-[#121418]/80 backdrop-blur-md border border-[#1E2228] shadow-xl rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <FiPackage className="text-[#0066FF]" /> Список товаров
          </h2>
          <InputField label="Поиск по названию" id="search-product" type="search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} icon={<FiSearch />} />
          
          {loading ? <p className="text-center py-4">Загрузка...</p> : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-[#0F1115] rounded-2xl border border-[#1E2228] p-5 flex flex-col">
                  <img src={product.imageUrl || 'https://via.placeholder.com/300'} alt={product.name} className="w-full h-40 object-cover rounded-lg mb-4" />
                  <h3 className="font-bold text-lg text-white truncate flex-grow">{product.name}</h3>
                  <div className="text-sm text-gray-400 mt-2 space-y-2">
                    <p className="flex justify-between"><span>Закупка:</span> <span className="font-mono text-white">{product.purchasePrice} ₽</span></p>
                    <p className="flex justify-between"><span>Продажа:</span> <span className="font-mono text-white">{product.salePrice} ₽</span></p>
                    <p className="flex justify-between"><span>На складе:</span> <span className="font-mono text-white">{product.quantity} шт.</span></p>
                  </div>
                  <div className="flex items-center gap-3 pt-4 mt-4 border-t border-[#1E2228]">
                    <button onClick={() => { setEditingProduct(product); setIsEditModalOpen(true); }} className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0066FF]/10 rounded-md hover:bg-[#0066FF]/20">
                      <FiEdit /> Изменить
                    </button>
                    <button onClick={() => setProductToDelete(product)} className="p-2 text-[#FF3B30] hover:bg-[#FF3B30]/20 rounded-md">
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
      {/* --- ИЗМЕНЕНО: Передаем новую функцию onSave в модальное окно --- */}
      <ProductEditModal 
        product={editingProduct} 
        open={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onSave={handleSaveProductEdit} 
        isLoading={isLoadingAction} 
        allStores={allStores} 
      />
      <ConfirmDialog open={!!productToDelete} message={`Удалить товар "${productToDelete?.name}"?`} onConfirm={executeDeleteProduct} onCancel={() => setProductToDelete(null)} />
    </>
  );
}
