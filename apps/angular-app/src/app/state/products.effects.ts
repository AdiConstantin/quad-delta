import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as A from './products.actions';
import { ProductsService } from '../services/products.service';
import { catchError, map, mergeMap, of } from 'rxjs';

@Injectable()
export class ProductsEffects {
  load$;
  create$;
  update$;
  delete$;

  constructor(private actions$: Actions, private api: ProductsService) {
    this.load$ = createEffect(() =>
      this.actions$.pipe(
        ofType(A.loadProducts),
        mergeMap(() => {
          console.log('Loading products from API...');
          return this.api.list().pipe(
            map(items => {
              console.log('Products loaded successfully:', items);
              return A.loadProductsSuccess({ items });
            }),
            catchError(error => {
              console.error('Failed to load products:', error);
              return of(A.loadProductsFailure({ error }));
            })
          );
        })
      )
    );

    this.create$ = createEffect(() =>
      this.actions$.pipe(
        ofType(A.createProduct),
        mergeMap(a => {
          console.log('Creating product with body:', a.body);
          return this.api.create(a.body).pipe(
            map(item => {
              console.log('Product created successfully:', item);
              return A.createProductSuccess({ item });
            }),
            catchError(error => {
              console.error('Product creation failed:', error);
              return of(A.createProductFailure({ error }));
            })
          );
        })
      )
    );

    this.update$ = createEffect(() =>
      this.actions$.pipe(
        ofType(A.updateProduct),
        mergeMap(a => this.api.update(a.id, a.body).pipe(
          map(item => A.updateProductSuccess({ item })),
          catchError(error => of(A.updateProductFailure({ error })))
        ))
      )
    );

    this.delete$ = createEffect(() =>
      this.actions$.pipe(
        ofType(A.deleteProduct),
        mergeMap(a => this.api.remove(a.id).pipe(
          map(() => A.deleteProductSuccess({ id: a.id })),
          catchError(error => of(A.deleteProductFailure({ error })))
        ))
      )
    );
  }
}
