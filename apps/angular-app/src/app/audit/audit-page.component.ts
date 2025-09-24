import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditService } from '../services/audit.service';
import { AuditLogEntry } from '../models/audit.model';

@Component({
  selector: 'app-audit-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit-page.component.html',
  styleUrls: ['./audit-page.component.scss']
})
export class AuditPageComponent implements OnInit {
  items: AuditLogEntry[] = [];
  table = 'Products';
  take = 50;
  expanded: Record<number, boolean> = {};

  loading = false;
  error: any = null;

  constructor(private api: AuditService) {}

  ngOnInit(): void { this.refresh(); }

  refresh() {
    this.loading = true; this.error = null;
    this.api.list(this.table || undefined, this.take).subscribe({
      next: data => { 
        this.items = data; 
        this.loading = false; 
      },
      error: err => { 
        this.error = err; 
        this.loading = false; 
      }
    });
  }

  toggle(id: number) { this.expanded[id] = !this.expanded[id]; }
  
  getActionClass(action: string): string {
    if (!action) return 'unknown';
    return action.toLowerCase();
  }
  
  getActionTitle(action: string): string {
    switch (action) {
      case 'INSERT': return 'Record Created';
      case 'UPDATE': return 'Record Updated';
      case 'DELETE': return 'Record Deleted';
      default: return 'Data Change';
    }
  }
  
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return dateString;
    }
  }
  
  getOldData(rowData: any): any {
    if (!rowData) return null;
    if (typeof rowData === 'string') {
      try {
        const parsed = JSON.parse(rowData);
        return parsed.old || parsed;
      } catch {
        return rowData;
      }
    }
    return rowData.old || rowData;
  }
  
  getNewData(rowData: any): any {
    if (!rowData) return null;
    if (typeof rowData === 'string') {
      try {
        const parsed = JSON.parse(rowData);
        return parsed.new || parsed;
      } catch {
        return rowData;
      }
    }
    return rowData.new || rowData;
  }
  
  formatJson(data: any): string {
    if (data == null || data === undefined) {
      return 'No data available';
    }
    try {
      if (typeof data === 'string') {
        // Try to parse if it's a JSON string
        try {
          const parsed = JSON.parse(data);
          return JSON.stringify(parsed, null, 2);
        } catch {
          return data;
        }
      }
      return JSON.stringify(data, null, 2);
    } catch (error) {
      return 'Invalid JSON data';
    }
  }
  
  pretty(json: any) { 
    return this.formatJson(json);
  }

  trackAuditId(index: number, e: AuditLogEntry): number {
    return (e as any)?.Id ?? index;
  }
}
