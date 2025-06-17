"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, FormEvent } from "react";
import { FiHome, FiUsers, FiPackage, FiArchive, FiAlertCircle } from "react-icons/fi";
import Header from "./components/Header";
import TabNavigation from "./components/TabNavigation";
import Footer from "./components/Footer";
import MainContent from "./components/MainContent";
import CashierEditModal from "./components/CashierEditModal";
import ConfirmDialog from "./components/ConfirmDialog";
import ProductEditModal from "./components/ProductEditModal"; // Добавьте импорт, если еще нет
import { AnimatePresence } from "framer-motion"; // Импортируем AnimatePresence

// Типы
import type { Cashier, Product, Store } from "./types";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [tab, setTab] = useState<"cashiers" | "products" | "stores">("cashiers");

  // --- Состояния для кассиров ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cashiers, setCashiers] = useState<Cashier[]>([]);
  const [loadingCashiers, setLoadingCashiers] = useState(false);
  const [cashierMessage, setCashierMessage] = useState<{ text: string | null; type: "success" | "error" } | null>(null);
  const [isLoadingCashierAction, setIsLoadingCashierAction] = useState(false);
  const [searchTermCashiers, setSearchTermCashiers] = useState("");
  const [editingCashier, setEditingCashier] = useState<Cashier | null>(null);
  const [isCashierEditModalOpen, setIsCashierEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [cashierToDelete, setCashierToDelete] = useState<Cashier | null>(null);

  // --- Состояния для товаров ---
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productName, setProductName] = useState("");
  const [productPurchasePrice, setProductPurchasePrice] = useState("");
  const [productSalePrice, setProductSalePrice] = useState("");
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productQuantity, setProductQuantity] = useState("");
  const [productMessage, setProductMessage] = useState<{ text: string | null; type: "success" | "error" } | null>(null);
  const [isLoadingProductAction, setIsLoadingProductAction] = useState(false);
  const [searchTermProducts, setSearchTermProducts] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductEditModalOpen, setIsProductEditModalOpen] = useState(false); // Для ProductEditModal
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [productDeleteConfirmOpen, setProductDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);


  // --- Состояния для магазинов ---
  const [stores, setStores] = useState<Store[]>([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [storeMessage, setStoreMessage] = useState<{ text: string | null; type: "success" | "error" } | null>(null);
  const [isLoadingStoreAction, setIsLoadingStoreAction] = useState(false);
  const [editStore, setEditStore] = useState<Store | null>(null);
  const [searchTermStores, setSearchTermStores] = useState("");
  const [selectedCashiersForStore, setSelectedCashiersForStore] = useState<string[]>([]);


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

          const cashiersData = await cashiersRes.json();
          setCashiers(cashiersData.cashiers || []);

          const productsData = await productsRes.json();
          setProducts(productsData.products || []);

          const storesData = await storesRes.json();
          setStores(storesData.stores || []);
        } catch (error) {
          console.error("Ошибка при загрузке данных:", error);
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
      <div className="flex flex-col justify-center items-center min-h-screen text-center p-8">
        <FiAlertCircle className="text-red-500 w-16 h-16 mb-4" />
        <h1 className="text-3xl font-bold text-red-600 mb-4">Доступ запрещен</h1>
        <p className="text-gray-700 mb-6">У вас нет прав для доступа к этой странице.</p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <FiHome /> Вернуться на главную
        </button>
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
        setCashierMessage(null); // Добавлено
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

  // Эта функция будет вызываться при подтверждении удаления кассира в диалоге
  const executeDeleteCashier = async (id: string) => {
    setIsLoadingCashierAction(true);
    setCashierMessage(null);
    try {
      await fetch(`/api/admin/cashiers/${id}`, { method: "DELETE" });
      setCashiers((prev) => prev.filter((cashier) => cashier.id !== id));
      setCashierMessage({ text: "Кассир успешно удален.", type: "success" });
    } catch (err) {
      console.error("Ошибка при удалении кассира:", err);
      setCashierMessage({ text: "Ошибка при удалении кассира.", type: "error" });
    } finally {
      setIsLoadingCashierAction(false);
      setDeleteConfirmOpen(false); // Закрываем диалог
      setCashierToDelete(null);   // Сбрасываем кассира для удаления
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
    selectedStores.forEach((storeId) => formData.append("storeIds", storeId));

    const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : "/api/admin/products";
    const method = editingProduct ? "PATCH" : "POST";

    try {
      const res = await fetch(url, { method, body: formData });
      const data = await res.json();
      if (res.ok) {
        if (editingProduct) {
          setProducts((prev) => prev.map(p => p.id === data.product.id ? data.product as Product : p));
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
        throw new Error(errorMessage);
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

  const handleDeleteStore = async (id: string) => {
    // УДАЛИТЕ ИЛИ ЗАКОММЕНТИРУЙТЕ ЭТУ СТРОКУ:
    // if (!confirm("Вы уверены, что хотите удалить этот магазин? Это действие необратимо.")) return; 
    setIsLoadingStoreAction(true);
    setStoreMessage(null);
    try {
      await fetch(`/api/admin/stores/${id}`, { method: "DELETE" });
      setStores((prev) => prev.filter((s) => s.id !== id));
      setStoreMessage({ text: "Магазин успешно удален.", type: "success" });
    } catch (err) {
      console.error("Delete store error:", err);
      setStoreMessage({ text: "Ошибка при удалении магазина.", type: "error" });
    } finally {
      setIsLoadingStoreAction(false);
    }
  };

  // Добавьте функцию handleSaveCashierEdit
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
    <div className="min-h-screen bg-gray-100">
      <Header userEmail={session?.user?.email || null} />
      <TabNavigation currentTab={tab} onTabChange={setTab} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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
            key="product-delete-confirm" // Ключ важен для AnimatePresence
            open={productDeleteConfirmOpen}
            message={`Вы уверены, что хотите удалить товар "${productToDelete?.name || 'неизвестный товар'}"? Это действие необратимо.`}
            onCancel={() => {
              setProductDeleteConfirmOpen(false);
              setProductToDelete(null);
            }}
            onConfirm={executeDeleteProduct}
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