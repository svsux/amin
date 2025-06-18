"use client";

import React, { useState, useEffect } from "react";
import { MdImageNotSupported } from "react-icons/md";

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
}

interface Props {
  isShiftOpen: boolean;
  dataVersion: number;
  onPaymentSuccess: () => void;
  setNotification: (notification: { message: string; type: 'success' | 'error' } | null) => void;
}

const CARD_HEIGHT = 210; // высота карточки товара (min-h-[210px])
const CARD_GAP = 16;     // gap-4 = 1rem = 16px
const ASSORTMENT_HEIGHT = CARD_HEIGHT * 2 + CARD_GAP; // две карточки + gap

const CashRegister: React.FC<Props> = ({ isShiftOpen, dataVersion, onPaymentSuccess, setNotification }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<{ id: string; quantity: number }[]>([]);
  const [total, setTotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "qr" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isShiftOpen) {
      const fetchProducts = async () => {
        try {
          setLoading(true);
          const response = await fetch("/api/cashier/store-products");
          if (!response.ok) {
            throw new Error("Не удалось загрузить список товаров.");
          }
          const data: Product[] = await response.json();
          setProducts(data);
        } catch (err) {
          setError((err as Error).message || "Ошибка при загрузке товаров.");
        } finally {
          setLoading(false);
        }
      };

      fetchProducts();
    } else {
      setProducts([]); // Очищаем список товаров, если смена закрыта
    }
  }, [isShiftOpen, dataVersion]);

  const handleAddProduct = (productId: string) => {
    const productInStock = products.find(p => p.id === productId);
    const productInCart = selectedProducts.find(p => p.id === productId);
    const currentCartQuantity = productInCart ? productInCart.quantity : 0;

    // Проверка, есть ли товар в наличии
    if (productInStock && productInStock.quantity > currentCartQuantity) {
      setSelectedProducts((prev) => {
        const existingProduct = prev.find((p) => p.id === productId);
        if (existingProduct) {
          return prev.map((p) =>
            p.id === productId ? { ...p, quantity: p.quantity + 1 } : p
          );
        }
        return [...prev, { id: productId, quantity: 1 }];
      });
    } else {
      setNotification({ message: "Товара больше нет в наличии.", type: 'error' });
    }
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts((prev) => {
      const updatedProducts = prev.map((p) =>
        p.id === productId ? { ...p, quantity: p.quantity - 1 } : p
      );
      return updatedProducts.filter((p) => p.quantity > 0);
    });
  };

  useEffect(() => {
    const calculateTotal = () => {
      const totalSum = selectedProducts.reduce((sum, item) => {
        const product = products.find((p) => p.id === item.id);
        return sum + (product?.price || 0) * item.quantity;
      }, 0);
      setTotal(totalSum);
    };

    calculateTotal();
  }, [selectedProducts, products]);

  const handlePayment = async () => {
    if (!paymentMethod) {
      setNotification({ message: "Выберите способ оплаты.", type: 'error' });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const productsWithPrice = selectedProducts.map(item => {
        const productDetails = products.find(p => p.id === item.id);
        return {
          ...item,
          price: productDetails?.price || 0,
        };
      });

      const response = await fetch("/api/cashier/transactions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: productsWithPrice,
          total,
          paymentMethod,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Не удалось завершить оплату.");
      }

      // Вызываем функции родителя для обновления и уведомления
      onPaymentSuccess();
      setNotification({ message: "Оплата успешно завершена!", type: 'success' });

      // Очищаем локальное состояние
      setSelectedProducts([]);
      setTotal(0);
      setPaymentMethod(null);
      
    } catch (err) {
      setNotification({ message: (err as Error).message || "Ошибка при оплате.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация товаров по поиску
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-transparent p-0 rounded-lg shadow-none space-y-6 relative text-white min-h-[540px] flex flex-col justify-between">
      {!isShiftOpen && (
        <div className="absolute inset-0 bg-[#181B20] bg-opacity-90 flex justify-center items-center z-10 rounded-lg">
          <p className="text-xl font-bold text-gray-400">Смена закрыта. Откройте смену, чтобы начать работу.</p>
        </div>
      )}
      <h2 className="text-xl font-bold text-indigo-400 mb-0">Касса</h2>
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1px_1fr] gap-6 flex-1">
        {/* Ассортимент */}
        <div className="flex flex-col" style={{ height: ASSORTMENT_HEIGHT }}>
          {/* <h3 className="text-lg font-semibold text-gray-200 mb-2">Ассортимент</h3> */}
          {/* Поиск */}
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по названию..."
            className="mb-3 px-3 py-2 rounded-md bg-[#23262B] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {loading ? (
            <div className="text-gray-400">Загрузка...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 h-full overflow-y-auto p-1">
              {filteredProducts.length > 0 ? filteredProducts.map((product) => {
                const cartItem = selectedProducts.find(p => p.id === product.id);
                const inCartQuantity = cartItem?.quantity || 0;
                const displayQuantity = product.quantity - inCartQuantity;
                const isOutOfStock = displayQuantity <= 0;

                return (
                  <div
                    key={product.id}
                    className="border border-[#23262B] rounded-lg shadow-sm flex flex-col overflow-hidden bg-[#181B20] min-h-[210px] h-[210px]"
                  >
                    <div className="w-full flex-shrink-0" style={{ height: "110px" }}>
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          style={{ maxHeight: "110px", minHeight: "110px" }}
                          onError={e => {
                            (e.currentTarget as HTMLImageElement).src = "/no-image.svg";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#23262B]">
                          <MdImageNotSupported className="text-4xl text-gray-500 opacity-60" />
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex flex-col flex-1 min-h-0">
                      <h4 className="font-semibold text-white truncate">{product.name}</h4>
                      <p className="text-sm text-gray-400">Остаток: {displayQuantity}</p>
                      <div className="mt-auto pt-2 flex justify-between items-center">
                        <p className="font-bold text-lg text-indigo-400">{product.price}₽</p>
                        <button
                          onClick={() => handleAddProduct(product.id)}
                          disabled={isOutOfStock}
                          className="px-2 py-1 bg-indigo-600 text-white rounded-md text-xs hover:bg-indigo-700 disabled:bg-gray-700 disabled:cursor-not-allowed"
                        >
                          В чек
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <p className="text-gray-400 text-sm col-span-3 text-center">Товары не найдены</p>
              )}
            </div>
          )}
        </div>
        {/* Вертикальная линия-разделитель */}
        <div className="hidden md:block h-full">
          <div className="border-r border-[#23262B] border-opacity-60 h-full mx-auto"></div>
        </div>
        {/* Текущий чек */}
        <div className="flex flex-col h-full">
          <h3 className="text-lg font-semibold text-gray-200 mb-2">Текущий чек</h3>
          <ul className="space-y-2 max-h-64 overflow-y-auto pr-2 border-b border-[#23262B] pb-4 flex-1">
            {selectedProducts.length > 0 ? selectedProducts.map((item) => {
              const product = products.find((p) => p.id === item.id);
              return (
                <li key={item.id} className="flex justify-between items-center text-sm bg-[#23262B] p-2 rounded-md">
                  <div className="font-medium text-white">
                    <p>{product?.name}</p>
                    <p className="text-xs text-gray-400">x {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-indigo-400">{(product?.price || 0) * item.quantity}₽</span>
                    <button onClick={() => handleRemoveProduct(item.id)} className="px-2 py-0.5 bg-red-600 text-white rounded hover:bg-red-700">-</button>
                  </div>
                </li>
              );
            }) : <p className="text-gray-400 text-sm">Чек пуст</p>}
          </ul>
          
          {/* Итог и оплата */}
          <div className="space-y-4 pt-4 mt-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">Итого:</h3>
              <h3 className="text-2xl font-bold text-indigo-400">{total.toFixed(2)}₽</h3>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setPaymentMethod("card")}
                className={`w-full py-2 rounded-md font-semibold transition ${
                  paymentMethod === "card"
                    ? "bg-indigo-600 text-white"
                    : "bg-[#23262B] text-gray-300 hover:bg-indigo-700"
                }`}
              >
                Картой
              </button>
              <button
                onClick={() => setPaymentMethod("qr")}
                className={`w-full py-2 rounded-md font-semibold transition ${
                  paymentMethod === "qr"
                    ? "bg-indigo-600 text-white"
                    : "bg-[#23262B] text-gray-300 hover:bg-indigo-700"
                }`}
              >
                Наличными
              </button>
            </div>
            <button
              onClick={handlePayment}
              disabled={loading || selectedProducts.length === 0 || !paymentMethod}
              className="w-full px-4 py-3 rounded-md font-bold text-white transition-colors duration-200 disabled:bg-gray-700 disabled:cursor-not-allowed bg-green-600 hover:bg-green-700"
            >
              {loading ? "Обработка..." : "Провести оплату"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashRegister;