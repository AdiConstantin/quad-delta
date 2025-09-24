import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as A from '../state/products.actions';
import { selectError, selectLoading, selectProducts } from '../state/products.selectors';
import { FormBuilder, Validators } from '@angular/forms';
import { Product } from '../models/product.model';
import { Observable } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';

@Component({
  selector: 'app-products-page',
  templateUrl: './products-page.component.html',
  styleUrls: ['./products-page.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class ProductsPageComponent implements OnInit {
  loading$!: Observable<boolean>;
  items$!: Observable<Product[]>;
  error$!: Observable<unknown>;

  editingId: number | null = null;

  form: FormGroup;

  statusMsg: string | null = null;

  constructor(private store: Store, private fb: FormBuilder, private actions$: Actions) {
    this.form = this.fb.group({
      sku: ['', Validators.required],
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    console.log('🚀 ProductsPageComponent ngOnInit called');
    this.loading$ = this.store.select(selectLoading);
    this.items$ = this.store.select(selectProducts);
    this.error$  = this.store.select(selectError);
    
    // Debug subscriptions
  this.loading$.subscribe(loading => console.log('📊 Loading state:', loading));
  this.items$.subscribe(items => console.log('📦 Items from store:', items));
  this.error$.subscribe(err => err && console.error('❌ Error state:', err));

    // Subscribe to action results for UX feedback
    this.actions$.pipe(
      ofType(
        A.createProduct, A.createProductSuccess, A.createProductFailure,
        A.updateProductSuccess, A.updateProductFailure,
        A.deleteProductSuccess, A.deleteProductFailure
      )
    ).subscribe(action => {
      switch (action.type) {
        case A.createProduct.type:
          this.statusMsg = 'Creating product...';
          break;
        case A.createProductSuccess.type:
          this.statusMsg = 'Product created successfully';
          break;
        case A.createProductFailure.type:
          this.statusMsg = 'Failed to create product';
          break;
        case A.updateProductSuccess.type:
          this.statusMsg = 'Product updated successfully';
          break;
        case A.updateProductFailure.type:
          this.statusMsg = 'Failed to update product';
          break;
        case A.deleteProductSuccess.type:
          this.statusMsg = 'Product deleted';
          break;
        case A.deleteProductFailure.type:
          this.statusMsg = 'Failed to delete product';
          break;
      }
      if (this.statusMsg) {
        setTimeout(() => { this.statusMsg = null; }, 2500);
      }
    });
    
    console.log('📡 Dispatching loadProducts action');
    this.store.dispatch(A.loadProducts());
  }

  submit() {
    console.log('🔥 Submit called!');
    console.log('📝 Form valid:', !this.form.invalid);
    console.log('📋 Form values:', this.form.value);
    console.log('✏️ Editing ID:', this.editingId);
    
    if (this.form.invalid) return;
    const { sku, name, price, isActive } = this.form.value;
    
    if (this.editingId == null) {
      console.log('➕ Creating new product:', { sku, name, price: Number(price), isActive: !!isActive });
      this.store.dispatch(A.createProduct({ body: { sku: sku!, name: name!, price: Number(price), isActive: !!isActive } }));
    } else {
      console.log('✏️ Updating product:', { id: this.editingId, body: { sku, name, price: Number(price), isActive: !!isActive } });
      this.store.dispatch(A.updateProduct({
        id: this.editingId,
        body: { sku: sku!, name: name!, price: Number(price), isActive: !!isActive }
      }));
    }
    this.cancel();
  }

  startEdit(p: Product) {
    this.editingId = p.id;
    this.form.setValue({ sku: p.sku, name: p.name, price: p.price, isActive: p.isActive });
  }

  cancel() {
    this.editingId = null;
    this.form.reset({ sku: '', name: '', price: 0, isActive: true });
  }

  remove(id: number) {
    this.store.dispatch(A.deleteProduct({ id }));
    if (this.editingId === id) this.cancel();
  }

  trackById(index: number, item: Product): number {
    return item.id;
  }
}
