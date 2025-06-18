"use client";

import React, { useState, useEffect } from "react";

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

const CashRegister: React.FC<Props> = ({ isShiftOpen, dataVersion, onPaymentSuccess, setNotification }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<{ id: string; quantity: number }[]>([]);
  const [total, setTotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "qr" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6 relative">
      {!isShiftOpen && (
        <div className="absolute inset-0 bg-gray-200 bg-opacity-75 flex justify-center items-center z-10 rounded-lg">
          <p className="text-xl font-bold text-gray-700">Смена закрыта. Откройте смену, чтобы начать работу.</p>
        </div>
      )}
      <h2 className="text-xl font-bold text-gray-800">Касса</h2>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Список товаров */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-700">Ассортимент</h3>
          {loading ? (
            <div>Загрузка...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[32rem] overflow-y-auto p-1">
              {products.map((product) => {
                const cartItem = selectedProducts.find(p => p.id === product.id);
                const inCartQuantity = cartItem?.quantity || 0;
                const displayQuantity = product.quantity - inCartQuantity;
                const isOutOfStock = displayQuantity <= 0;

                return (
                  <div key={product.id} className="border rounded-lg shadow-sm flex flex-col overflow-hidden">
                    <div className="relative w-full h-32 bg-gray-200">
                      <img
                        src={product.imageUrl || "https://via.placeholder.com/300"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3 flex flex-col flex-grow">
                      <h4 className="font-semibold text-gray-800 truncate">{product.name}</h4>
                      <p className="text-sm text-gray-500">Остаток: {displayQuantity}</p>
                      <div className="mt-auto pt-2 flex justify-between items-center">
                        <p className="font-bold text-lg text-indigo-600">{product.price}₽</p>
                        <button
                          onClick={() => handleAddProduct(product.id)}
                          disabled={isOutOfStock}
                          className="px-2 py-1 bg-indigo-500 text-white rounded-md text-xs hover:bg-indigo-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          В чек
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Чек */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-700">Текущий чек</h3>
          <ul className="space-y-2 max-h-64 overflow-y-auto pr-2 border-b pb-4">
            {selectedProducts.length > 0 ? selectedProducts.map((item) => {
              const product = products.find((p) => p.id === item.id);
              return (
                <li key={item.id} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded-md">
                  <div className="font-medium text-gray-800">
                    <p>{product?.name}</p>
                    <p className="text-xs text-gray-500">x {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-900">{(product?.price || 0) * item.quantity}₽</span>
                    <button onClick={() => handleRemoveProduct(item.id)} className="px-2 py-0.5 bg-red-500 text-white rounded hover:bg-red-600">-</button>
                  </div>
                </li>
              );
            }) : <p className="text-gray-500 text-sm">Чек пуст</p>}
          </ul>
          
          {/* Итог и оплата */}
          <div className="space-y-4 pt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-900">Итого:</h3>
              <h3 className="text-2xl font-bold text-gray-900">{total.toFixed(2)}₽</h3>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setPaymentMethod("card")}
                className={`w-full py-2 rounded-md ${paymentMethod === "card" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"}`}
              >
                Картой
              </button>
              <button
                onClick={() => setPaymentMethod("qr")}
                className={`w-full py-2 rounded-md ${paymentMethod === "qr" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"}`}
              >
                Наличными
              </button>
            </div>
            <button
              onClick={handlePayment}
              disabled={loading || selectedProducts.length === 0 || !paymentMethod}
              className="w-full px-4 py-3 rounded-md font-bold text-white transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed bg-green-500 hover:bg-green-600"
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