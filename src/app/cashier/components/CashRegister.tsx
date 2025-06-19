"use client";

import React, { useState, useEffect } from "react";
import { MdImageNotSupported } from "react-icons/md";
import { FiPlus } from "react-icons/fi";

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
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isShiftOpen) {
      const fetchProducts = async () => {
        setLoading(true);
        try {
          const response = await fetch("/api/cashier/store-products");
          if (!response.ok) throw new Error("Не удалось загрузить товары.");
          const data: Product[] = await response.json();
          setProducts(data);
        } catch (err) {
          setNotification({ message: (err as Error).message, type: 'error' });
        } finally {
          setLoading(false);
        }
      };
      fetchProducts();
    } else {
      setProducts([]);
    }
  }, [isShiftOpen, dataVersion]);

  const handleAddProduct = (productId: string) => {
    const productInStock = products.find(p => p.id === productId);
    const productInCart = selectedProducts.find(p => p.id === productId);
    const currentCartQuantity = productInCart ? productInCart.quantity : 0;

    if (productInStock && productInStock.quantity > currentCartQuantity) {
      setSelectedProducts((prev) => {
        const existingProduct = prev.find((p) => p.id === productId);
        if (existingProduct) {
          return prev.map((p) => p.id === productId ? { ...p, quantity: p.quantity + 1 } : p);
        }
        return [...prev, { id: productId, quantity: 1 }];
      });
    } else {
      setNotification({ message: "Товара больше нет в наличии.", type: 'error' });
    }
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts((prev) => {
      const updated = prev.map((p) => p.id === productId ? { ...p, quantity: p.quantity - 1 } : p);
      return updated.filter((p) => p.quantity > 0);
    });
  };

  useEffect(() => {
    const newTotal = selectedProducts.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.id);
      return sum + (product?.price || 0) * item.quantity;
    }, 0);
    setTotal(newTotal);
  }, [selectedProducts, products]);

  const handlePayment = async () => {
    if (!paymentMethod) {
      setNotification({ message: "Выберите способ оплаты.", type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const productsWithPrice = selectedProducts.map(item => ({
        ...item,
        price: products.find(p => p.id === item.id)?.price || 0,
      }));

      const response = await fetch("/api/cashier/transactions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: productsWithPrice, total, paymentMethod }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Не удалось завершить оплату.");
      }
      onPaymentSuccess();
      setNotification({ message: "Оплата успешно завершена!", type: 'success' });
      setSelectedProducts([]);
      setPaymentMethod(null);
    } catch (err) {
      setNotification({ message: (err as Error).message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-[#181B20] p-6 rounded-xl border border-[#23262B] relative min-h-[600px]">
      <div className={`absolute inset-0 bg-[#181B20]/90 backdrop-blur-sm flex justify-center items-center z-20 rounded-xl transition-opacity ${isShiftOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <p className="text-xl font-bold text-gray-400">Откройте смену, чтобы начать работу.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">
        {/* Левая часть: Ассортимент */}
        <div className="flex flex-col space-y-4">
          <h2 className="text-2xl font-bold text-white">Касса</h2>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по названию..."
            className="w-full px-4 py-2 rounded-lg bg-[#23262B] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {loading ? (
            <div className="flex justify-center items-center h-full text-gray-400">Загрузка товаров...</div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto pr-2" style={{maxHeight: 'calc(100vh - 350px)', minHeight: '400px'}}>
              {filteredProducts.length > 0 ? filteredProducts.map((product) => {
                const cartItem = selectedProducts.find(p => p.id === product.id);
                const inCartQuantity = cartItem?.quantity || 0;
                const displayQuantity = product.quantity - inCartQuantity;
                const isOutOfStock = displayQuantity <= 0;

                return (
                  <div key={product.id} className="group relative bg-[#23262B] rounded-lg shadow-sm flex flex-col overflow-hidden transition-all duration-300 hover:shadow-indigo-500/20 hover:ring-1 hover:ring-indigo-500">
                    <div className="w-full h-32 flex-shrink-0">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" onError={e => { (e.currentTarget as HTMLImageElement).src = "/no-image.svg"; }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#2a2e37]"><MdImageNotSupported className="text-4xl text-gray-500" /></div>
                      )}
                    </div>
                    <div className="p-3 flex flex-col flex-1">
                      <h4 className="font-semibold text-white truncate text-sm">{product.name}</h4>
                      <p className="text-xs text-gray-400">Остаток: {displayQuantity}</p>
                      <div className="mt-auto pt-2 flex justify-between items-center">
                        <p className="font-bold text-lg text-indigo-400">{product.price}₽</p>
                        <button onClick={() => handleAddProduct(product.id)} disabled={isOutOfStock} className="p-2 bg-indigo-600 text-white rounded-full text-xs hover:bg-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-transform group-hover:scale-110"><FiPlus size={16}/></button>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <p className="text-gray-400 text-sm col-span-full text-center pt-10">Товары не найдены</p>
              )}
            </div>
          )}
        </div>
        
        {/* Правая часть: Чек */}
        <div className="flex flex-col bg-[#23262B] p-4 rounded-lg border border-[#2d3138]">
          <h3 className="text-xl font-semibold text-white mb-4">Текущий чек</h3>
          <div className="flex-grow overflow-y-auto pr-2 space-y-2" style={{maxHeight: 'calc(100vh - 480px)'}}>
            {selectedProducts.length > 0 ? selectedProducts.map((item) => {
              const product = products.find((p) => p.id === item.id);
              return (
                <div key={item.id} className="flex justify-between items-center text-sm bg-[#2a2e37] p-2 rounded-md">
                  <div>
                    <p className="font-medium text-white truncate max-w-[150px]">{product?.name}</p>
                    <p className="text-xs text-gray-400">{(product?.price || 0)}₽ x {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-indigo-400 w-16 text-right">{(product?.price || 0) * item.quantity}₽</span>
                    <button onClick={() => handleRemoveProduct(item.id)} className="px-2 py-0.5 bg-red-600 text-white rounded hover:bg-red-700">-</button>
                  </div>
                </div>
              );
            }) : <p className="text-gray-500 text-sm text-center pt-10">Добавьте товары из ассортимента</p>}
          </div>
          
          <div className="border-t border-gray-700 mt-4 pt-4 space-y-4">
            <div className="flex justify-between items-baseline">
              <h3 className="text-2xl font-bold text-white">Итого:</h3>
              <h3 className="text-3xl font-bold text-indigo-400">{total.toFixed(2)}₽</h3>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setPaymentMethod("card")} className={`w-full py-2 rounded-md font-semibold transition ${paymentMethod === "card" ? "bg-indigo-600 text-white ring-2 ring-indigo-400" : "bg-[#2a2e37] text-gray-300 hover:bg-gray-600"}`}>Картой</button>
              <button onClick={() => setPaymentMethod("qr")} className={`w-full py-2 rounded-md font-semibold transition ${paymentMethod === "qr" ? "bg-indigo-600 text-white ring-2 ring-indigo-400" : "bg-[#2a2e37] text-gray-300 hover:bg-gray-600"}`}>Наличными</button>
            </div>
            <button onClick={handlePayment} disabled={loading || selectedProducts.length === 0 || !paymentMethod} className="w-full px-4 py-3 rounded-lg font-bold text-lg text-white transition-colors duration-200 disabled:bg-gray-700 disabled:cursor-not-allowed bg-green-600 hover:bg-green-500">
              {loading ? "Обработка..." : "Провести оплату"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashRegister;