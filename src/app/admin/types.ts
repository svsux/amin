export interface Cashier {
  id: string;
  email: string;
}

export interface Store {
  id: string;
  name: string;
  address: string | null;
  cashiers: StoreCashierAssociation[];
  products: StoreProductAssociation[];
}

export interface StoreCashierAssociation {
  cashierId: string;
  cashier: Cashier;
}

export interface StoreProduct {
  store: {
    id: string;
    name: string;
    address?: string | null;
  };
}

export interface Product {
  id: string;
  name: string;
  purchasePrice: number;
  salePrice: number;
  imageUrl?: string | null;
  quantity: number;
  storeProducts?: StoreProduct[]; // 💡 типизировано правильно
}

export interface StoreProductAssociation {
  productId: string;
  product: Product;
}

export interface AnimatedSelectProps {
  stores: { id: string | number; name: string }[];
  selectedStores: string[];
  onChange: (selected: string[]) => void;
}

// Utility type for store options
export type StoreOption = { value: string; label: string };

// Example usage:
// const storeOptions: StoreOption[] = stores.map(store => ({ value: String(store.id), label: store.name }));
// const handleChange = (selected: string[]) => { /* handle selected stores */ };
export interface StoreCashierAssociation {
  cashierId: string;
  cashier: Cashier;
}

export interface StoreProduct {
  store: {
    id: string;
    name: string;
    address?: string | null;
  };
}

export interface Product {
  id: string;
  name: string;
  purchasePrice: number;
  salePrice: number;
  imageUrl?: string | null;
  quantity: number;
  storeProducts?: StoreProduct[]; // 💡 типизировано правильно
}

export interface StoreProductAssociation {
  productId: string;
  product: Product;
}
