"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, FormEvent } from "react";
import { FiHome, FiUsers, FiPackage, FiArchive, FiAlertCircle, FiBarChart2 } from "react-icons/fi";
import Header from "./components/Header";
import TabNavigation from "./components/TabNavigation";
import Footer from "./components/Footer";
import MainContent from "./components/MainContent";
import CashierEditModal from "./components/CashierEditModal";
import ConfirmDialog from "./components/ConfirmDialog";
import ProductEditModal from "./components/ProductEditModal";
import ReportsSection from "./components/ReportsSection";
import { AnimatePresence } from "framer-motion";
import type { Cashier, Product, Store } from "./types";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [tab, setTab] = useState<"cashiers" | "products" | "stores" | "reports">("cashiers");

  // --- Состояния для кассиров ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cashiers, setCashiers] = useState<Cashier[]>([]);
  const [loadingCashiers, setLoadingCashiers] = useState(false);
  const [cashierMessage, setCashierMessage] = useState<{ text: string | null; type: "success" | "error" | "info" } | null>(null);
  const [isLoadingCashierAction, setIsLoadingCashierAction] = useState(false);
  const [searchTermCashiers, setSearchTermCashiers] = useState("");
  const [editingCashier, setEditingCashier] = useState<Cashier | null>(null);
  const [isCashierEditModalOpen, setIsCashierEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [cashierToDelete, setCashierToDelete] = useState<Cashier | null>(null);

  // --- Функции для кассиров ---
  const handleDeleteCashier = (cashier: Cashier) => {
    setCashierToDelete(cashier);
    setDeleteConfirmOpen(true);
  };

  const openEditCashierModal = (cashier: Cashier) => {
    setEditingCashier(cashier);
    setIsCashierEditModalOpen(true);
  };

  // --- Состояния для товаров ---
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productName, setProductName] = useState("");
  const [productPurchasePrice, setProductPurchasePrice] = useState("");
  const [productSalePrice, setProductSalePrice] = useState("");
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productQuantity, setProductQuantity] = useState("");
  const [productMessage, setProductMessage] = useState<{ text: string | null; type: "success" | "error" | "info" } | null>(null);
  const [isLoadingProductAction, setIsLoadingProductAction] = useState(false);
  const [searchTermProducts, setSearchTermProducts] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductEditModalOpen, setIsProductEditModalOpen] = useState(false);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [productDeleteConfirmOpen, setProductDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // --- Состояния для магазинов ---
  const [stores, setStores] = useState<Store[]>([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [storeMessage, setStoreMessage] = useState<{ text: string | null; type: "success" | "error" | "info" } | null>(null);
  const [isLoadingStoreAction, setIsLoadingStoreAction] = useState(false);
  const [editStore, setEditStore] = useState<Store | null>(null);
  const [searchTermStores, setSearchTermStores] = useState("");
  const [selectedCashiersForStore, setSelectedCashiersForStore] = useState<string[]>([]);
  const [storeToDelete, setStoreToDelete] = useState<Store | null>(null);
  const [storeDeleteConfirmOpen, setStoreDeleteConfirmOpen] = useState(false);

  // --- ЭФФЕКТЫ ДЛЯ АВТОМАТИЧЕСКОГО СКРЫТИЯ УВЕДОМЛЕНИЙ ---
  useEffect(() => {
    if (storeMessage?.text) {
      const timer = setTimeout(() => setStoreMessage({ text: null, type: "info" }), 5000);
      return () => clearTimeout(timer);
    }
  }, [storeMessage]);

  useEffect(() => {
    if (cashierMessage?.text) {
      const timer = setTimeout(() => setCashierMessage({ text: null, type: "info" }), 5000);
      return () => clearTimeout(timer);
    }
  }, [cashierMessage]);

  useEffect(() => {
    if (productMessage?.text) {
      const timer = setTimeout(() => setProductMessage({ text: null, type: "info" }), 5000);
      return () => clearTimeout(timer);
    }
  }, [productMessage]);

  // --- Загрузка данных ---
  useEffect(() => {
    const fetchAllData = async () => {
      if (session?.user?.role === "ADMIN") {
        setLoadingCashiers(true);
        setLoadingProducts(true);
        setLoadingStores(true);

        try {
          const [cashiersRes, productsRes, storesRes] = await Promise.all([
            fetch("/api/admin/cashiers"),
            fetch("/api/admin/products"),
            fetch("/api/admin/stores"),
          ]);

          // ИСПРАВЛЕНО: Явная проверка, что данные являются массивом
          const cashiersData = await cashiersRes.json();
          setCashiers(Array.isArray(cashiersData) ? cashiersData : []);

          // ИСПРАВЛЕНО: Явная проверка, что данные являются массивом
          const productsData = await productsRes.json();
          setProducts(Array.isArray(productsData) ? productsData : []);

          // ИСПРАВЛЕНО: Явная проверка, что данные являются массивом
          const storesData = await storesRes.json();
          setStores(Array.isArray(storesData) ? storesData : []);

        } catch (error) {
          console.error("Ошибка при загрузке данных:", error);
          // В случае ошибки устанавливаем пустые массивы, чтобы избежать падения
          setCashiers([]);
          setProducts([]);
          setStores([]);
          setCashierMessage({ text: "Ошибка загрузки кассиров.", type: "error" });
          setProductMessage({ text: "Ошибка загрузки товаров.", type: "error" });
          setStoreMessage({ text: "Ошибка загрузки магазинов.", type: "error" });
        } finally {
          setLoadingCashiers(false);
          setLoadingProducts(false);
          setLoadingStores(false);
        }
      }
    };
    if (status === "authenticated") {
      fetchAllData();
    }
  }, [session, status]);

  // --- Аутентификация и авторизация (ИСПРАВЛЕННЫЙ БЛОК) ---
  useEffect(() => {
    // Выполняем перенаправление после рендеринга, если пользователь не аутентифицирован
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div className="flex justify-center items-center min-h-screen text-lg font-semibold text-gray-700">Загрузка данных администратора...</div>;
  }

  // Пока происходит перенаправление, показываем сообщение
  if (status === "unauthenticated") {
    return <div className="flex justify-center items-center min-h-screen text-lg">Перенаправление на страницу входа...</div>;
  }

  if (session?.user?.role !== "ADMIN") {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center p-8 bg-[#0F1115]">
        <FiAlertCircle className="text-[#FF3B30] w-16 h-16 mb-4" />
        <h2 className="text-2xl font-bold text-white">Доступ запрещен</h2>
        <p className="text-[#A0A8B8] mt-2">У вас нет прав для просмотра этой страницы.</p>
      </div>
    );
  }

  // --- Handlers ---
  const handleCreateCashier = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoadingCashierAction(true);
    setCashierMessage(null);
    try {
      const response = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: "CASHIER" }),
      });
      const data = await response.json();
      if (response.ok) {
        setCashierMessage({ text: `Кассир ${data.user.email} успешно создан!`, type: "success" });
        setEmail("");
        setPassword("");
        setCashiers((prev) => [data.user as Cashier, ...prev]);
      } else {
        setCashierMessage({ text: data.message || "Ошибка при создании кассира.", type: "error" });
      }
    } catch (err) {
      console.error("Create cashier error:", err);
      setCashierMessage({ text: "Ошибка сети при создании кассира.", type: "error" });
    } finally {
      setIsLoadingCashierAction(false);
    }
  };

  const executeDeleteCashier = async (id: string) => {
    setIsLoadingCashierAction(true);
    setCashierMessage(null);

    try {
      const response = await fetch(`/api/admin/cashiers/${id}`, { method: "DELETE" });

      if (!response.ok) {
        let errorData: { message?: string } = {};
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: `Ошибка ${response.status}: Не удалось обработать ответ от сервера.` };
        }
        throw new Error(errorData.message || `Ошибка при удалении кассира (статус ${response.status}).`);
      }

      setCashiers((prev) => prev.filter((cashier) => cashier.id !== id));
      setCashierMessage({ text: "Кассир успешно удален.", type: "success" });
    } catch (err) {
      const error = err as Error;
      setCashierMessage({
        text: error.message || "Произошла непредвиденная ошибка при удалении кассира.",
        type: "error",
      });
    } finally {
      setIsLoadingCashierAction(false);
      setDeleteConfirmOpen(false);
      setCashierToDelete(null);
    }
  };

  const resetProductForm = () => {
    setProductName("");
    setProductPurchasePrice("");
    setProductSalePrice("");
    setProductImage(null);
    setProductQuantity("");
    setSelectedStores([]);
    const fileInput = document.getElementById("product-image-input") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
    setEditingProduct(null);
  };

  const handleProductSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoadingProductAction(true);
    setProductMessage(null);

    const formData = new FormData();
    formData.append("name", productName);
    formData.append("purchasePrice", productPurchasePrice);
    formData.append("salePrice", productSalePrice);
    formData.append("quantity", productQuantity);
    if (productImage) formData.append("image", productImage);

    // Убедитесь, что поле `stores` отправляется как JSON-строка
    formData.append("stores", JSON.stringify(selectedStores || []));

    const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : "/api/admin/products";
    const method = editingProduct ? "PATCH" : "POST";

    try {
      const res = await fetch(url, { method, body: formData });
      const data = await res.json();
      if (res.ok) {
        if (editingProduct) {
          setProducts((prev) => prev.map((p) => (p.id === data.product.id ? data.product as Product : p)));
          setProductMessage({ text: "Товар успешно обновлен!", type: "success" });
        } else {
          setProducts((prev) => [data.product as Product, ...prev]);
          setProductMessage({ text: "Товар успешно добавлен!", type: "success" });
        }
        resetProductForm();
      } else {
        setProductMessage({ text: data.message || `Ошибка при ${editingProduct ? 'обновлении' : 'добавлении'} товара.`, type: "error" });
      }
    } catch (err) {
      console.error("Product submit error:", err);
      setProductMessage({ text: `Ошибка сети при ${editingProduct ? 'обновлении' : 'добавлении'} товара.`, type: "error" });
    } finally {
      setIsLoadingProductAction(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductEditModalOpen(true); // Открываем ProductEditModal
  };
  
  // Эта функция будет открывать диалог подтверждения для удаления товара
  const handleDeleteProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setProductToDelete(product);
      setProductDeleteConfirmOpen(true);
    }
  };

  // Эта функция будет вызываться при подтверждении удаления товара в диалоге
  const executeDeleteProduct = async () => {
    if (!productToDelete) return;

    setIsLoadingProductAction(true);
    setProductMessage(null);
    try {
      const res = await fetch(`/api/admin/products/${productToDelete.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        let errorMessage = `Ошибка ${res.status}: ${res.statusText}`;
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          const textError = await res.text();
          errorMessage = textError || errorMessage;
        }
        // Вместо throw:
        setProductMessage({ text: errorMessage, type: 'error' });
        setIsLoadingProductAction(false);
        setProductDeleteConfirmOpen(false);
        setProductToDelete(null);
        return; // Завершаем выполнение функции
      }

      setProducts((prevProducts) => prevProducts.filter((p) => p.id !== productToDelete.id));
      setProductMessage({ text: 'Товар успешно удален!', type: 'success' });
    } catch (error: any) {
      console.error("❌ Ошибка при удалении товара:", error);
      setProductMessage({ text: error.message || 'Произошла неизвестная ошибка при удалении товара.', type: 'error' });
    } finally {
      setIsLoadingProductAction(false);
      setProductDeleteConfirmOpen(false); // Закрываем диалог
      setProductToDelete(null); // Сбрасываем товар для удаления
    }
  };


  const resetStoreForm = () => {
    setStoreName("");
    setStoreAddress("");
    setSelectedCashiersForStore([]); // ИСПРАВЛЕНО: setSelectedCashiersForStore
    setEditStore(null);
  };

  const handleStoreSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoadingStoreAction(true);
    setStoreMessage(null);
    const payload = {
      name: storeName,
      address: storeAddress,
      cashierIds: selectedCashiersForStore, // ИСПРАВЛЕНО: selectedCashiersForStore
    };
    const url = editStore ? `/api/admin/stores/${editStore.id}` : "/api/admin/stores";
    const method = editStore ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        if (editStore) {
          setStores((prev) => prev.map((s) => (s.id === data.store.id ? data.store as Store : s)));
          setStoreMessage({ text: "Магазин успешно обновлён!", type: "success" });
        } else {
          setStores((prev) => [data.store as Store, ...prev]);
          setStoreMessage({ text: "Магазин успешно создан!", type: "success" });
        }
        resetStoreForm();
      } else {
        setStoreMessage({ text: data.message || `Ошибка при ${editStore ? 'обновлении' : 'создании'} магазина.`, type: "error" });
      }
    } catch (err) {
      console.error("Store submit error:", err);
      setStoreMessage({ text: `Ошибка сети при ${editStore ? 'обновлении' : 'создании'} магазина.`, type: "error" });
    } finally {
      setIsLoadingStoreAction(false);
    }
  };

  const handleEditStore = (store: Store) => {
    setEditStore(store);
    setStoreName(store.name);
    setStoreAddress(store.address || "");
    setSelectedCashiersForStore(store.cashiers.map((c) => c.cashierId)); // ИСПРАВЛЕНО: setSelectedCashiersForStore
    setStoreMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteStore = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    if (store) {
      setStoreToDelete(store);
      setStoreDeleteConfirmOpen(true);
    }
  };

  const executeDeleteStore = async () => {
    if (!storeToDelete) return;
    setIsLoadingStoreAction(true);
    setStoreMessage(null);
    try {
      const res = await fetch(`/api/admin/stores/${storeToDelete.id}`, { method: "DELETE" });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Ошибка при удалении магазина.`);
      }
      setStores((prev) => prev.filter((s) => s.id !== storeToDelete.id));
      setStoreMessage({ text: "Магазин успешно удален.", type: "success" });
    } catch (err) {
      console.error("Delete store error:", err);
      setStoreMessage({ text: (err as Error).message || "Ошибка при удалении магазина.", type: "error" });
    } finally {
      setIsLoadingStoreAction(false);
      setStoreDeleteConfirmOpen(false);
      setStoreToDelete(null);
    }
  };

  const handleSaveCashierEdit = async (updatedCashier: { email: string; password?: string }) => {
    if (!editingCashier) return;

    setIsLoadingCashierAction(true);
    setCashierMessage(null);

    try {
      const response = await fetch(`/api/admin/cashiers/${editingCashier.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCashier),
      });

      const data = await response.json();
      if (response.ok) {
        setCashiers((prev) =>
          prev.map((cashier) => (cashier.id === editingCashier.id ? { ...cashier, ...data.cashier } : cashier))
        );
        setCashierMessage({ text: "Кассир успешно обновлен!", type: "success" });
        setIsCashierEditModalOpen(false); // Закрытие модального окна
        setEditingCashier(null); // Сброс текущего кассира
      } else {
        setCashierMessage({ text: data.message || "Ошибка при обновлении кассира.", type: "error" });
      }
    } catch (err) {
      console.error("Ошибка при обновлении кассира:", err);
      setCashierMessage({ text: "Ошибка сети при обновлении кассира.", type: "error" });
    } finally {
      setIsLoadingCashierAction(false);
    }
  };

  const handleProductEditSubmit = async (data: { // Для ProductEditModal
    name: string;
    purchasePrice: string;
    salePrice: string;
    quantity: string;
    image: File | null;
    stores: string[];
  }) => {
    if (!editingProduct) return;
    setIsLoadingProductAction(true);
    setProductMessage(null);
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

      const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: "PATCH",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: `Ошибка ${res.status}`}));
        throw new Error(errorData.message || `Ошибка при обновлении товара`);
      }
      const updatedProduct: Product = await res.json();
      setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
      setProductMessage({ text: "Товар успешно обновлен!", type: "success" });
      setIsProductEditModalOpen(false);
      setEditingProduct(null);
    } catch (error: any) {
      console.error("Ошибка обновления товара:", error);
      setProductMessage({ text: error.message || "Не удалось обновить товар.", type: "error" });
    } finally {
      setIsLoadingProductAction(false);
    }
  };


  // --- Tab Navigation ---
  return (
    <div className="min-h-screen bg-[#0F1115]">
      <Header userEmail={session?.user?.email || null} />
      {/* Вам нужно будет добавить новую вкладку "Отчеты" в сам компонент TabNavigation */}
      <TabNavigation currentTab={tab} onTabChange={setTab} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Условный рендеринг для отображения секции отчетов */}
        {tab === 'reports' ? (
          <ReportsSection />
        ) : (
          <MainContent
            tab={tab}
            cashiersProps={{
              email,
              password,
              cashiers,
              loadingCashiers,
              cashierMessage,
              isLoadingCashierAction,
              searchTermCashiers,
              setEmail,
              setPassword,
              setSearchTermCashiers,
              handleCreateCashier,
              openEditCashierModal: (cashier) => {
                setEditingCashier(cashier);
                setIsCashierEditModalOpen(true);
              },
              handleDeleteCashier: (id: string) => {
                const foundCashier = cashiers.find((cashier) => cashier.id === id);
                if (foundCashier) {
                  setCashierToDelete(foundCashier);
                  setDeleteConfirmOpen(true);
                }
              },
            }}
            productsProps={{
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
              editingProduct, // Передаем editingProduct
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
              handleEditProduct, // Передаем handleEditProduct
              handleDeleteProduct,
              resetProductForm,
            }}
            storesProps={{
              storeName,
              storeAddress,
              selectedCashiers: selectedCashiersForStore,
              stores,
              cashiers,
              loadingStores,
              storeMessage,
              isLoadingStoreAction,
              editStore,
              searchTermStores,
              setStoreName,
              setStoreAddress,
              setSelectedCashiers: setSelectedCashiersForStore,
              setSearchTermStores,
              handleStoreSubmit,
              handleEditStore,
              handleDeleteStore,
              resetStoreForm,
              setStoreMessage,
            }}
          />
        )}
      </main>
      <Footer />

      <AnimatePresence>
        {editingCashier && isCashierEditModalOpen && (
          <CashierEditModal
            key="cashier-edit-modal" // Ключ важен для AnimatePresence
            cashier={editingCashier}
            open={isCashierEditModalOpen}
            onClose={() => {
              setIsCashierEditModalOpen(false);
              setEditingCashier(null);
            }}
            onSave={handleSaveCashierEdit}
            isLoading={isLoadingCashierAction}
          />
        )}

        {deleteConfirmOpen && cashierToDelete && (
          <ConfirmDialog
            key="cashier-delete-confirm" // Ключ важен для AnimatePresence
            open={deleteConfirmOpen}
            message={`Вы уверены, что хотите удалить кассира ${cashierToDelete?.email || "неизвестного кассира"}? Это действие необратимо.`}
            onCancel={() => {
              setDeleteConfirmOpen(false);
              setCashierToDelete(null);
            }}
            onConfirm={() => {
              if (cashierToDelete) {
                executeDeleteCashier(cashierToDelete.id);
              }
            }}
          />
        )}

        {productDeleteConfirmOpen && productToDelete && (
          <ConfirmDialog
            key="product-delete-confirm"
            open={productDeleteConfirmOpen}
            message={`Вы уверены, что хотите удалить товар "${productToDelete?.name || 'неизвестный товар'}"? Это действие необратимо.`}
            onCancel={() => {
              setProductDeleteConfirmOpen(false);
              setProductToDelete(null);
            }}
            onConfirm={executeDeleteProduct}
          />
        )}

        {storeDeleteConfirmOpen && storeToDelete && (
          <ConfirmDialog
            key="store-delete-confirm"
            open={storeDeleteConfirmOpen}
            message={`Вы уверены, что хотите удалить магазин "${storeToDelete?.name}"? Все связанные с ним смены и транзакции также будут удалены.`}
            onCancel={() => {
              setStoreDeleteConfirmOpen(false);
              setStoreToDelete(null);
            }}
            onConfirm={executeDeleteStore}
          />
        )}

        {isProductEditModalOpen && editingProduct && (
           <ProductEditModal
            key="product-edit-modal" // Ключ важен для AnimatePresence
            isOpen={isProductEditModalOpen}
            onClose={() => {
              setIsProductEditModalOpen(false);
              setEditingProduct(null);
              resetProductForm(); // Опционально, если нужно сбрасывать главную форму
            }}
            editingProduct={editingProduct}
            storeOptions={stores.map(s => ({ value: s.id, label: s.name }))}
            onSubmit={handleProductEditSubmit}
            isLoading={isLoadingProductAction}
          />
        )}
      </AnimatePresence>
    </div>
  );
}