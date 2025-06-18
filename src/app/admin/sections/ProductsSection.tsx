"use client";

import React, { useRef } from "react";
import Alert from "../components/Alert";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import AnimatedSelect from "../components/AnimatedSelect";
import Image from "next/image";
import {
  FiBox,
  FiTrash,
  FiPlus,
  FiPackage,
  FiSearch,
  FiEdit,
  FiUploadCloud,
} from "react-icons/fi";
import type { Product, Store } from "../types";

type StoreOption = { label: string; value: string };

interface Props {
  products: Product[];
  loadingProducts: boolean;
  productMessage: { text: string | null; type: "success" | "error" | "info" } | null;
  isLoadingProductAction: boolean;
  productName: string;
  productPurchasePrice: string;
  productSalePrice: string;
  productImage: File | null;
  productQuantity: string;
  searchTermProducts: string;
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
  loadingProducts,
  productMessage,
  isLoadingProductAction,
  productName,
  productPurchasePrice,
  productSalePrice,
  productImage,
  productQuantity,
  searchTermProducts,
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

  const handleStoreSelectChange = (selectedOptions: readonly StoreOption[] | null) => {
    const updatedStores = selectedOptions ? selectedOptions.map((o) => o.value) : [];
    setSelectedStores(updatedStores);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTermProducts.toLowerCase())
  );

  return (
    <section className="space-y-10">
      {/* Форма добавления нового товара */}
      <div className="bg-[#121418]/80 backdrop-blur-md border border-[#1E2228] shadow-xl rounded-2xl p-8 transition-all">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <FiPlus className="text-[#0066FF]" />
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
            placeholder="Например, Хлеб 'Бородинский'"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <InputField
              label="Закуп. цена (₽)"
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
            <InputField
              label="Кол-во на складе"
              id="product-quantity"
              type="number"
              value={productQuantity}
              onChange={(e) => setProductQuantity(e.target.value)}
              required
              min={0}
              placeholder="10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#A0A8B8] mb-1">
              Магазины, где будет доступен товар
            </label>
            <AnimatedSelect
              isMulti
              options={storeOptions}
              value={storeOptions.filter(option => selectedStores.includes(option.value))}
              onChange={handleStoreSelectChange}
              classNamePrefix="react-select"
              placeholder="Выберите магазины..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#A0A8B8] mb-1">
              Изображение товара
            </label>
            <div
              onClick={handleFileClick}
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-[#1E2228] border-dashed rounded-md cursor-pointer hover:border-[#0066FF]/60 transition-colors"
            >
              <div className="space-y-1 text-center">
                <FiUploadCloud className="mx-auto h-12 w-12 text-[#A0A8B8]" />
                <div className="flex text-sm text-[#A0A8B8]">
                  <p className="pl-1">
                    {productImage ? (
                      <span className="font-semibold text-white">{productImage.name}</span>
                    ) : (
                      <>
                        <span className="font-semibold text-[#0066FF]">Нажмите, чтобы загрузить</span> или перетащите файл
                      </>
                    )}
                  </p>
                </div>
                <p className="text-xs text-[#A0A8B8]/70">PNG, JPG, GIF до 10MB</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              id="product-image-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <PrimaryButton type="submit" disabled={isLoadingProductAction} className="flex-1">
              {isLoadingProductAction ? "Добавление..." : "Добавить товар"}
            </PrimaryButton>
            <button
              type="button"
              onClick={resetProductForm}
              className="flex-1 py-2.5 px-4 border border-[#1E2228] rounded-md shadow-sm text-sm font-semibold text-[#A0A8B8] bg-[#121418] hover:bg-[#1E2228] transition-colors"
            >
              Очистить форму
            </button>
          </div>
        </form>
      </div>

      {/* Список товаров */}
      <div className="bg-[#121418]/80 backdrop-blur-md border border-[#1E2228] shadow-xl rounded-2xl p-8 transition-all">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <FiPackage className="text-[#0066FF]" />
          Список товаров
        </h2>

        <div className="mb-6 relative">
          <InputField
            label="Поиск по названию товара"
            id="search-product"
            type="search"
            value={searchTermProducts}
            onChange={(e) => setSearchTermProducts(e.target.value)}
            placeholder="Введите название..."
            icon={<FiSearch className="w-5 h-5 text-gray-400" />}
          />
        </div>

        {loadingProducts ? (
          <p className="text-[#A0A8B8] text-center py-4">Загрузка товаров...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-[#A0A8B8] text-center py-4">Товары не найдены.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-[#0F1115] rounded-2xl border border-[#1E2228] p-5 flex flex-col justify-between transition-all duration-300 hover:border-[#0066FF]/60 hover:shadow-lg hover:shadow-[#0066FF]/10"
              >
                <div className="flex-grow">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          width={80}
                          height={80}
                          className="object-cover rounded-lg border border-[#1E2228]"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-[#121418] rounded-lg flex items-center justify-center text-[#A0A8B8] border border-[#1E2228]">
                          <FiBox size={32} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-white leading-tight">{product.name}</h3>
                      <p className="text-sm text-[#A0A8B8] mt-1">
                        В наличии: <span className="font-semibold text-white">{product.quantity} шт.</span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#A0A8B8]">Закупка:</span>
                      <span className="font-mono text-white">{product.purchasePrice.toFixed(2)} ₽</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#A0A8B8]">Продажа:</span>
                      <span className="font-mono font-bold text-green-400">{product.salePrice.toFixed(2)} ₽</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-5 mt-5 border-t border-[#1E2228]">
                  <button
                    onClick={() => handleEditProduct(product)}
                    disabled={isLoadingProductAction}
                    className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0066FF]/10 border border-transparent rounded-md hover:bg-[#0066FF]/20 transition-colors disabled:opacity-50"
                  >
                    <FiEdit />
                    Изменить
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    disabled={isLoadingProductAction}
                    className="p-2 text-[#FF3B30] hover:bg-[#FF3B30]/20 rounded-md transition-colors disabled:opacity-50"
                    title="Удалить товар"
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

export default ProductsSection;
