"use client";

import React, { useRef, useState } from "react";
import Alert from "../components/Alert";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import DangerButton from "../components/DangerButton";
import ProductEditModal from "../components/ProductEditModal";
import AnimatedSelect from "../components/AnimatedSelect";
import Image from "next/image";
import {
  FiBox,
  FiTrash,
  FiPlus,
  FiPackage,
  FiSearch,
  FiEdit,
} from "react-icons/fi";
import type { Product, Store } from "../types";

type StoreOption = { label: string; value: string };

interface Props {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  loadingProducts: boolean;
  productMessage: { text: string | null; type: "success" | "error" } | null;
  isLoadingProductAction: boolean;
  productName: string;
  productPurchasePrice: string;
  productSalePrice: string;
  productImage: File | null;
  productQuantity: string;
  searchTermProducts: string;
  editingProduct: Product | null;
  selectedStores: string[];
  stores: Store[];
  setProductName: (v: string) => void;
  setProductPurchasePrice: (v: string) => void;
  setProductSalePrice: (v: string) => void;
  setProductImage: (v: File | null) => void;
  setProductQuantity: (v: string) => void;
  setSearchTermProducts: (v: string) => void;
  setSelectedStores: (v: string[]) => void;
  handleProductSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleEditProduct: (product: Product) => void;
  handleDeleteProduct: (id: string) => void;
  resetProductForm: () => void;
}

const ProductsSection: React.FC<Props> = ({
  products,
  setProducts,
  loadingProducts,
  productMessage,
  isLoadingProductAction,
  productName,
  productPurchasePrice,
  productSalePrice,
  productImage,
  productQuantity,
  searchTermProducts,
  editingProduct,
  selectedStores,
  stores,
  setProductName,
  setProductPurchasePrice,
  setProductSalePrice,
  setProductImage,
  setProductQuantity,
  setSearchTermProducts,
  setSelectedStores,
  handleProductSubmit,
  handleEditProduct,
  handleDeleteProduct,
  resetProductForm,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const storeOptions: StoreOption[] = stores.map((store) => ({
    value: String(store.id),
    label: store.name,
  }));

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProductImage(file);
  };

  const handleChange = (selectedOptions: readonly StoreOption[] | null) => {
    setSelectedStores(selectedOptions ? selectedOptions.map((o) => o.value) : []);
  };

  const openEditModal = (product: Product) => {
    handleEditProduct(product);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    resetProductForm();
    setIsEditModalOpen(false);
  };

  const handleEditSubmit = async (data: {
    name: string;
    purchasePrice: string;
    salePrice: string;
    quantity: string;
    image: File | null;
    stores: string[];
  }) => {
    if (!editingProduct) return;

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("purchasePrice", data.purchasePrice);
      formData.append("salePrice", data.salePrice);
      formData.append("quantity", data.quantity);
      formData.append("stores", JSON.stringify(data.stores));
      if (data.image) {
        formData.append("image", data.image);
      }

      // ИСПРАВЛЕННЫЙ URL ЗАПРОСА
      const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: "PATCH",
        body: formData,
      });

      if (!res.ok) {
        const errorMessage = await res.text(); 
        console.error(`Ошибка при обновлении товара: ${errorMessage}`);
        if (res.status === 404) {
          throw new Error("Ошибка: маршрут не найден (404). Проверьте URL /api/admin/products/[id].");
        } else {
          throw new Error(`Ошибка при обновлении товара (${res.status}): ${errorMessage}`);
        }
      }

      const updatedProduct: Product = await res.json();
      console.log("✅ Обновлённый товар:", updatedProduct);

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === updatedProduct.id ? updatedProduct : product
        )
      );

      closeEditModal();
    } catch (error) {
      console.error("❌ Ошибка обновления товара:", error);
      // Здесь можно добавить уведомление для пользователя об ошибке
    }
  };

  const customStyles = {
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

  return (
    <section className="space-y-10">
      {isEditModalOpen && editingProduct && (
        <ProductEditModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          editingProduct={editingProduct}
          storeOptions={storeOptions}
          onSubmit={handleEditSubmit}
          isLoading={isLoadingProductAction}
        />
      )}

      {/* Добавление нового товара */}
      <div className="bg-white/80 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl p-8 transition-all">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FiPlus className="text-indigo-600" /> {/* ИЗМЕНЕНО */}
          Добавить новый товар
        </h2>

        {productMessage && (
          <Alert message={productMessage.text} type={productMessage.type || "info"} />
        )}

        <form onSubmit={handleProductSubmit} className="space-y-5">
          <InputField
            label="Название товара"
            id="product-name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
            placeholder="Например, Хлеб"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputField
              label="Закупочная цена (₽)"
              id="product-purchase-price"
              type="number"
              value={productPurchasePrice}
              onChange={(e) => setProductPurchasePrice(e.target.value)}
              required
              min={0}
              step="0.01"
              placeholder="100.00"
            />
            <InputField
              label="Цена продажи (₽)"
              id="product-sale-price"
              type="number"
              value={productSalePrice}
              onChange={(e) => setProductSalePrice(e.target.value)}
              required
              min={0}
              step="0.01"
              placeholder="150.00"
            />
          </div>

          <InputField
            label="Количество на складе"
            id="product-quantity"
            type="number"
            value={productQuantity}
            onChange={(e) => setProductQuantity(e.target.value)}
            required
            min={0}
            placeholder="10"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Магазины, где есть товар
            </label>
            <AnimatedSelect
              isMulti
              options={storeOptions}
              value={storeOptions.filter(option => selectedStores.includes(option.value))}
              onChange={handleChange}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Выберите магазины..."
              styles={customStyles}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Изображение товара (необязательно)
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleFileClick}
                className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition"
              >
                Выберите файл
              </button>
              <span className="text-sm text-gray-500">
                {productImage?.name || "Файл не выбран"}
              </span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="flex gap-2">
            <PrimaryButton type="submit" disabled={isLoadingProductAction} className="flex-1">
              {isLoadingProductAction ? "Добавление..." : "Добавить товар"}
            </PrimaryButton>
          </div>
        </form>
      </div>

      {/* Список товаров */}
      <div className="bg-white/80 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl p-8 transition-all">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FiPackage className="text-indigo-600" /> {/* ИЗМЕНЕНО */}
          Список товаров
        </h2>

        <div className="mb-6 relative">
          <InputField
            label="Поиск по названию товара"
            id="search-product"
            type="search"
            value={searchTermProducts}
            onChange={(e) => setSearchTermProducts(e.target.value)}
            placeholder="Поиск по названию..."
            className="pl-10"
            icon={<FiSearch className="w-5 h-5 text-gray-400" />}
          />
        </div>

        {loadingProducts ? (
          <p className="text-gray-600 text-center py-4">Загрузка товаров...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-600 text-center py-4">Товары не найдены или еще не добавлены.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto pr-2">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-gray-200 shadow hover:shadow-md p-5 flex flex-col justify-between transition-all"
              >
                <div className="flex items-center gap-4">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={60}
                      height={60}
                      className="object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-[60px] h-[60px] bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
                      <FiBox size={28} className="text-gray-500" /> {/* Можно изменить на text-indigo-600 */}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600">Закуп: {product.purchasePrice}₽</p>
                    <p className="text-sm text-gray-600">Продажа: {product.salePrice}₽</p>
                    <p className="text-sm text-gray-600">Кол-во: {product.quantity}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      <span className="font-medium">Магазины:</span>{" "}
                      {
                        product.storeProducts?.length
                          ? product.storeProducts
                              .map((sp) =>
                                sp.store?.address
                                  ? `${sp.store.name} (${sp.store.address})`
                                  : sp.store?.name
                              )
                              .filter(Boolean)
                              .join(", ")
                          : "Нет"
                      }
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <PrimaryButton
                    type="button"
                    onClick={() => openEditModal(product)}
                    disabled={isLoadingProductAction}
                    className="flex-1"
                  >
                    <FiEdit className="mr-2 text-white" /> {/* ИЗМЕНЕНО (если фон кнопки темный) или оставить currentColor */}
                    Редактировать
                  </PrimaryButton>
                  <DangerButton
                    onClick={() => handleDeleteProduct(product.id)}
                    disabled={isLoadingProductAction}
                    className="flex-1"
                  >
                    <FiTrash className="mr-2 text-white" /> {/* ИЗМЕНЕНО (если фон кнопки темный) или оставить currentColor */}
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
};

export default ProductsSection;
