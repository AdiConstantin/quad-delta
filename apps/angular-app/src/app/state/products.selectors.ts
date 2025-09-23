import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProductsState } from './products.reducer';

export const selectProductsState = createFeatureSelector<ProductsState>('products');

export const selectProducts = createSelector(selectProductsState, s => s.items);
export const selectLoading  = createSelector(selectProductsState, s => s.loading);
export const selectError    = createSelector(selectProductsState, s => s.error);
