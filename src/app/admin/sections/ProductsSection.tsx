import Alert from "../components/Alert";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import DangerButton from "../components/DangerButton";
import Image from "next/image";
import { FiBox, FiEdit, FiTrash, FiPlus, FiPackage, FiSearch } from "react-icons/fi";
import React from "react";
import type { Product, Store } from "../types"; // Импорт типов из types.ts

interface Props {
  products: Product[];
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
}) => (
  <section className="space-y-6">
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        {editingProduct ? <><FiEdit /> Редактировать товар</> : <><FiPlus /> Добавить новый товар</>}
      </h2>
      <Alert message={productMessage?.text ?? null} type={productMessage?.type || "info"} />
      <form onSubmit={handleProductSubmit} className="space-y-4">
        <InputField label="Название товара" id="product-name" value={productName} onChange={e => setProductName(e.target.value)} required placeholder="Например, Хлеб" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Закупочная цена (₽)" id="product-purchase-price" type="number" value={productPurchasePrice} onChange={e => setProductPurchasePrice(e.target.value)} required min={0} step="0.01" placeholder="100.00" />
          <InputField label="Цена продажи (₽)" id="product-sale-price" type="number" value={productSalePrice} onChange={e => setProductSalePrice(e.target.value)} required min={0} step="0.01" placeholder="150.00" />
        </div>
        <InputField label="Количество на складе" id="product-quantity" type="number" value={productQuantity} onChange={e => setProductQuantity(e.target.value)} required min={0} placeholder="10" />
        <div>
          <label htmlFor="product-stores-select" className="block text-sm font-medium text-gray-700 mb-1">Магазины, где есть товар</label>
          {stores.length === 0 ? (
            <p className="text-sm text-gray-500">Сначала добавьте магазины.</p>
          ) : (
            <select
              id="product-stores-select"
              multiple
              value={selectedStores}
              onChange={e => setSelectedStores(Array.from(e.target.selectedOptions, o => o.value))}
              className="mt-1 block w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              {stores.map(store => (
                <option key={store.id} value={store.id}>{store.name}</option>
              ))}
            </select>
          )}
          <p className="text-xs text-gray-500 mt-1">Удерживайте Ctrl (или Cmd на Mac) для выбора нескольких.</p>
        </div>
        <div>
          <label htmlFor="product-image-input" className="block text-sm font-medium text-gray-700 mb-1">Изображение товара (необязательно)</label>
          <input id="product-image-input" type="file" accept="image/*" onChange={e => setProductImage(e.target.files?.[0] || null)} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors cursor-pointer" />
          {editingProduct && editingProduct.imageUrl && !productImage && (
            <div className="mt-2">
              <p className="text-xs text-gray-500">Текущее изображение:</p>
              <Image src={editingProduct.imageUrl} alt={editingProduct.name} width={60} height={60} className="rounded object-cover mt-1" />
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <PrimaryButton type="submit" disabled={isLoadingProductAction} className="flex-1">
            {isLoadingProductAction ? (editingProduct ? "Сохранение..." : "Добавление...") : (editingProduct ? "Сохранить изменения" : "Добавить товар")}
          </PrimaryButton>
          {editingProduct && (
            <button type="button" onClick={resetProductForm} className="flex-1 py-2.5 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              Отмена
            </button>
          )}
        </div>
      </form>
    </div>
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"><FiPackage /> Список товаров</h2>
      <div className="mb-4 relative">
        <InputField
          label="Поиск по названию товара"
          id="search-product"
          type="search"
          value={searchTermProducts}
          onChange={e => setSearchTermProducts(e.target.value)}
          placeholder="Поиск по названию..."
        />
        <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 mt-0.5 text-gray-400" />
      </div>
      {loadingProducts ? (
        <p className="text-gray-600 text-center py-4">Загрузка товаров...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-600 text-center py-4">Товары не найдены или еще не добавлены.</p>
      ) : (
        <div className="max-h-[600px] overflow-y-auto border border-gray-200 rounded-md">
          <ul className="divide-y divide-gray-200">
            {products.map((product) => (
              <li key={product.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.name} width={80} height={80} className="object-cover rounded-md flex-shrink-0" />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 flex-shrink-0">
                      <FiBox size={32} />
                    </div>
                  )}
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600">Закуп: <span className="font-medium">{product.purchasePrice}₽</span></p>
                    <p className="text-sm text-gray-600">Продажа: <span className="font-medium">{product.salePrice}₽</span></p>
                    <p className="text-sm text-gray-600">Кол-во: <span className="font-medium">{product.quantity}</span></p>
                    <p className="text-xs text-gray-500 mt-2">
                      <span className="font-medium">Магазины:</span>{" "}
                      {
                        product.storeProducts && product.storeProducts.length > 0
                          ? product.storeProducts
                              .map(sp => sp.store?.address
                                ? `${sp.store.name} (${sp.store.address})`
                                : sp.store?.name
                              )
                              .filter(Boolean)
                              .join(", ")
                          : "Нет"
                      }
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 mt-2 sm:mt-0 flex-shrink-0">
                    <button onClick={() => handleEditProduct(product)} disabled={isLoadingProductAction} className="text-blue-600 hover:text-blue-800 font-semibold transition flex items-center gap-1 disabled:text-gray-400">
                      <FiEdit /> Редакт.
                    </button>
                    <DangerButton onClick={() => handleDeleteProduct(product.id)} disabled={isLoadingProductAction}>
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

export default ProductsSection;