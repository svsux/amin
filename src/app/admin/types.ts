export interface Cashier {
  id: string;
  email: string;
}

export interface Product {
  id: string;
  name: string;
  purchasePrice: number;
  salePrice: number;
  imageUrl?: string | null;
  quantity: number;
  storeProducts?: { store: { name: string; address?: string | null } }[];
}

export interface StoreCashierAssociation {
  cashierId: string;
  cashier: Cashier;
}

export interface StoreProductAssociation {
  productId: string;
  product: Product;
}

export interface Store {
  id: string;
  name: string;
  address: string | null;
  cashiers: StoreCashierAssociation[];
  products: StoreProductAssociation[];
}