// =================================================================
// ОСНОВНЫЕ МОДЕЛИ ДАННЫХ
// Описывают фундаментальные сущности: Кассир, Товар, Магазин.
// =================================================================

export interface Cashier {
  id: string;
  email: string;
  // Используется, чтобы показать, к скольким магазинам привязан кассир.
  storeCashiers?: { storeId: string }[];
}

export interface Product {
  id: string;
  name: string;
  purchasePrice: number;
  salePrice: number;
  quantity: number;
  imageUrl: string | null;
  // Используется, чтобы показать, в каких магазинах есть товар.
  storeProducts?: { store: { id: string; name: string } }[];
}

export interface Store {
  id: string;
  name: string;
  address: string | null;
  // Эти поля соответствуют результату `include` в Prisma
  cashiers: StoreCashierAssociation[];
  products: StoreProductAssociation[];
}


// =================================================================
// ТИПЫ-СВЯЗКИ (ASSOCIATION TYPES)
// Описывают структуру данных, которую мы получаем из связующих таблиц.
// =================================================================

export interface StoreCashierAssociation {
  cashierId: string;
  // Вложенный объект кассира, который мы получаем через `include`
  cashier: Cashier;
}

export interface StoreProductAssociation {
  productId: string;
  // Вложенный объект товара, который мы получаем через `include`
  product: Product;
}


// =================================================================
// ВСПОМОГАТЕЛЬНЫЕ И UI-ТИПЫ
// Типы для компонентов интерфейса и других утилит.
// =================================================================

/**
 * Описывает структуру сообщения для компонента Alert.
 */
export interface AlertMessage {
  text: string;
  type: "success" | "error" | "info";
}

/**
 * Универсальный тип для опций в выпадающих списках (Select).
 */
export type Option = {
  value: string;
  label: string;
};
