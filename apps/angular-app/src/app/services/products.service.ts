import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Product, ProductCreate, ProductUpdate } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private base = `${environment.apiUrl}/api/products`;
  constructor(private http: HttpClient) {}
  
  list(): Observable<Product[]> {
    return this.http.get<Product[]>(this.base);
  }
  create(body: ProductCreate): Observable<Product> {
    return this.http.post<Product>(this.base, body);
  }
  update(id: number, body: ProductUpdate): Observable<Product> {
    return this.http.put<Product>(`${this.base}/${id}`, body);
  }
  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
