import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as A from './products.actions';
import { ProductsService } from '../services/products.service';
import { catchError, map, mergeMap, of } from 'rxjs';

@Injectable()
export class ProductsEffects {
  load$;
  create$;

  constructor(private actions$: Actions, private api: ProductsService) {
    this.load$ = createEffect(() =>
      this.actions$.pipe(
        ofType(A.loadProducts),
        mergeMap(() => {
          // console.log('🔄 EFFECT: Starting API call');
          return this.api.list().pipe(
            map(items => {
              // console.log('✅ EFFECT: API success, dispatching success action with', items.length, 'items');
              return A.loadProductsSuccess({ items });
            }),
            catchError(error => {
              // console.error('❌ EFFECT: API error:', error);
              return of(A.loadProductsFailure({ error }));
            })
          );
        })
      )
    );

    this.create$ = createEffect(() =>
      this.actions$.pipe(
        ofType(A.createProduct),
        mergeMap(a => this.api.create(a.body).pipe(
          map(item => A.createProductSuccess({ item })),
          catchError(error => of(A.createProductFailure({ error })))
        ))
      )
    );
  }
}
