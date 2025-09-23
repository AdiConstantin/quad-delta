import { createReducer, on } from '@ngrx/store';
import * as A from './products.actions';
import { Product } from '../models/product.model';

export interface ProductsState {
  items: Product[];
  loading: boolean;
  error: any;
}

export const initialState: ProductsState = {
  items: [],
  loading: false,
  error: null
};

export const productsReducer = createReducer(
  initialState,
  on(A.loadProducts, (s) => {
    // console.log('📡 REDUCER: loadProducts - current state:', s.items.length, 'items');
    return { ...s, loading: true, error: null };
  }),
  on(A.loadProductsSuccess, (s, { items }) => {
    // console.log('✅ REDUCER: loadProductsSuccess - setting', items.length, 'items');
    return { ...s, loading: false, items };
  }),
  on(A.loadProductsFailure, (s, { error }) => {
    // console.log('❌ REDUCER: loadProductsFailure');
    return { ...s, loading: false, error };
  }),

  on(A.createProduct, (s) => ({ ...s, loading: true })),
  on(A.createProductSuccess, (s, { item }) => ({ ...s, loading: false, items: [...s.items, item] })),
  on(A.createProductFailure, (s, { error }) => ({ ...s, loading: false, error })),
);