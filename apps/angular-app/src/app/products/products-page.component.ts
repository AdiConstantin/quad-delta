import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as A from '../state/products.actions';
import { selectLoading, selectProducts } from '../state/products.selectors';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, take } from 'rxjs';
import { Product } from '../models/product.model';

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
  form: FormGroup;

  constructor(private store: Store, private fb: FormBuilder) {
    this.form = this.fb.group({
      sku: ['', Validators.required],
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    // console.log('🔧 ProductsPageComponent ngOnInit called');
    this.loading$ = this.store.select(selectLoading);
    this.items$ = this.store.select(selectProducts);
    
    // Always dispatch - let the backend handle duplicates
    // console.log('🔄 Dispatching loadProducts');
    this.store.dispatch(A.loadProducts());
  }

  create() {
    if (this.form.invalid) return;
    const { sku, name, price } = this.form.value;
    this.store.dispatch(A.createProduct({ body: { sku: sku!, name: name!, price: Number(price) } }));
    this.form.reset({ sku: '', name: '', price: 0 });
  }
}
