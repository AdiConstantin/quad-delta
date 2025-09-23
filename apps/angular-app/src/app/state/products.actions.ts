import { createAction, props } from '@ngrx/store';
import { Product, ProductCreate } from '../models/product.model';

export const loadProducts = createAction('[Products] Load');
export const loadProductsSuccess = createAction('[Products] Load Success', props<{ items: Product[] }>());
export const loadProductsFailure = createAction('[Products] Load Failure', props<{ error: any }>());

export const createProduct = createAction('[Products] Create', props<{ body: ProductCreate }>());
export const createProductSuccess = createAction('[Products] Create Success', props<{ item: Product }>());
export const createProductFailure = createAction('[Products] Create Failure', props<{ error: any }>());