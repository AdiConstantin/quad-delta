export interface AuditLogEntry {
  Id: number;
  TableName: string;
  Action: 'INSERT'|'UPDATE'|'DELETE';
  RowData: any;           // JSON
  ChangedAt: string;
  ChangedBy: string | null;
}
