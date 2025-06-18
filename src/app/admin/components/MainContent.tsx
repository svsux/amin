import CashiersSection from "../sections/CashiersSection";
import ProductsSection from "../sections/ProductsSection";
import StoresSection from "../sections/StoresSection";
import ReportsSection from "./ReportsSection"; // Импортируем секцию отчетов
import type { Cashier, Product, Store } from "../types";

interface MainContentProps {
  tab: "cashiers" | "products" | "stores" | "reports";
  // Props for CashiersSection
  cashiersProps: {
    email: string;
    password: string;
    cashiers: Cashier[];
    loadingCashiers: boolean;
    cashierMessage: { text: string | null; type: "success" | "error" | "info" } | null;
    isLoadingCashierAction: boolean;
    searchTermCashiers: string;
    setEmail: (v: string) => void;
    setPassword: (v: string) => void;
    setSearchTermCashiers: (v: string) => void;
    handleCreateCashier: (e: React.FormEvent<HTMLFormElement>) => void;
    handleDeleteCashier: (id: string) => void;
    openEditCashierModal: (cashier: Cashier) => void;
  };
  // Props for ProductsSection
  productsProps: {
    products: Product[];
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
    loadingProducts: boolean;
    productMessage: { text: string | null; type: "success" | "error" | "info" } | null;
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
  };
  // Props for StoresSection
  storesProps: {
    storeName: string;
    storeAddress: string;
    selectedCashiers: string[];
    stores: Store[];
    cashiers: Cashier[];
    loadingStores: boolean;
    storeMessage: { text: string | null; type: "success" | "error" | "info" } | null;
    isLoadingStoreAction: boolean;
    editStore: Store | null;
    searchTermStores: string;
    setStoreName: (v: string) => void;
    setStoreAddress: (v: string) => void;
    setSelectedCashiers: (v: string[]) => void;
    setSearchTermStores: (v: string) => void;
    handleStoreSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    handleEditStore: (store: Store) => void;
    handleDeleteStore: (storeId: string) => void;
    resetStoreForm: () => void;
    setStoreMessage: (v: { text: string | null; type: "success" | "error" | "info" } | null) => void;
  };
}

export default function MainContent({
  tab,
  cashiersProps,
  productsProps,
  storesProps,
}: MainContentProps) {
  return (
    <div className="px-4 py-6 sm:px-0 relative min-h-[80vh]">
      {tab === "cashiers" && <CashiersSection {...cashiersProps} />}
      {tab === "products" && <ProductsSection {...productsProps} />}
      {tab === "stores" && <StoresSection {...storesProps} />}
      {tab === "reports" && <ReportsSection />}
    </div>
  );
}
