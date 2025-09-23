export interface Product {
  id: number;
  sku: string;
  name: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface ProductCreate {
  sku: string;
  name: string;
  price: number;
}

export interface ProductUpdate {
  sku: string;
  name: string;
  price: number;
  isActive: boolean;
}
