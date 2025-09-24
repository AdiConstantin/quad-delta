import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { AuditLogEntry } from '../models/audit.model';

@Injectable({ providedIn: 'root' })
export class AuditService {
  private base = `/api/audit`;
  constructor(private http: HttpClient) {}

  list(table?: string, take: number = 100): Observable<AuditLogEntry[]> {
    let params = new HttpParams().set('take', take);
    if (table) params = params.set('table', table);
    return this.http.get<AuditLogEntry[]>(this.base, { params });
  }
}
