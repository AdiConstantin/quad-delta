import { createAction, props } from '@ngrx/store';
import { Product, ProductCreate, ProductUpdate } from '../models/product.model';

export const loadProducts = createAction('[Products] Load');
export const loadProductsSuccess = createAction('[Products] Load Success', props<{ items: Product[] }>());
export const loadProductsFailure = createAction('[Products] Load Failure', props<{ error: any }>());

export const createProduct = createAction('[Products] Create', props<{ body: ProductCreate }>());
export const createProductSuccess = createAction('[Products] Create Success', props<{ item: Product }>());
export const createProductFailure = createAction('[Products] Create Failure', props<{ error: any }>());

export const updateProduct = createAction('[Products] Update', props<{ id: number; body: ProductUpdate }>());
export const updateProductSuccess = createAction('[Products] Update Success', props<{ item: Product }>());
export const updateProductFailure = createAction('[Products] Update Failure', props<{ error: any }>());

export const deleteProduct = createAction('[Products] Delete', props<{ id: number }>());
export const deleteProductSuccess = createAction('[Products] Delete Success', props<{ id: number }>());
export const deleteProductFailure = createAction('[Products] Delete Failure', props<{ error: any }>());