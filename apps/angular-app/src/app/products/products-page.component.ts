import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as A from '../state/products.actions';
import { selectLoading, selectProducts } from '../state/products.selectors';
import { FormBuilder, Validators } from '@angular/forms';
import { Product } from '../models/product.model';
import { Observable } from 'rxjs';

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

  editingId: number | null = null;

  form: FormGroup;

  constructor(private store: Store, private fb: FormBuilder) {
    this.form = this.fb.group({
      sku: ['', Validators.required],
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loading$ = this.store.select(selectLoading);
    this.items$ = this.store.select(selectProducts);
    this.store.dispatch(A.loadProducts());
  }

  submit() {
    if (this.form.invalid) return;
    const { sku, name, price, isActive } = this.form.value;
    if (this.editingId == null) {
      this.store.dispatch(A.createProduct({ body: { sku: sku!, name: name!, price: Number(price) } }));
    } else {
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
}
