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
        mergeMap(() => this.api.list().pipe(
          map(items => A.loadProductsSuccess({ items })),
          catchError(error => of(A.loadProductsFailure({ error })))
        ))
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
