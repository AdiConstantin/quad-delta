import { createReducer, on } from '@ngrx/store';
import * as A from './products.actions';
import { Product } from '../models/product.model';

export interface ProductsState {
  items: Product[];
  loading: boolean;
  error: any;
}
export const initialState: ProductsState = { items: [], loading: false, error: null };

export const productsReducer = createReducer(
  initialState,
  on(A.loadProducts, (s) => ({ ...s, loading: true, error: null })),
  on(A.loadProductsSuccess, (s, { items }) => ({ ...s, loading: false, items })),
  on(A.loadProductsFailure, (s, { error }) => ({ ...s, loading: false, error })),

  on(A.createProduct, (s) => ({ ...s, loading: true })),
  on(A.createProductSuccess, (s, { item }) => ({ ...s, loading: false, items: [...s.items, item] })),
  on(A.createProductFailure, (s, { error }) => ({ ...s, loading: false, error })),

  on(A.updateProduct, (s) => ({ ...s, loading: true })),
  on(A.updateProductSuccess, (s, { item }) => ({
    ...s, loading: false,
    items: s.items.map(x => x.id === item.id ? item : x)
  })),
  on(A.updateProductFailure, (s, { error }) => ({ ...s, loading: false, error })),

  on(A.deleteProduct, (s) => ({ ...s, loading: true })),
  on(A.deleteProductSuccess, (s, { id }) => ({
    ...s, loading: false,
    items: s.items.filter(x => x.id !== id)
  })),
  on(A.deleteProductFailure, (s, { error }) => ({ ...s, loading: false, error })),
);
