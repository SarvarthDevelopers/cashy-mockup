export interface ColumnDef {
  key: string;
  label: string;
  width: number;
  minWidth: number;
  visible: boolean;
  sortable: boolean;
}

export const DEFAULT_COLUMNS: ColumnDef[] = [
  { key: 'customerId', label: 'Customer ID', width: 100, minWidth: 90, visible: true, sortable: false },
  { key: 'name', label: 'Customer Name', width: 150, minWidth: 120, visible: true, sortable: false },
  { key: 'email', label: 'Email', width: 180, minWidth: 140, visible: true, sortable: false },
  { key: 'phone', label: 'Phone', width: 140, minWidth: 110, visible: true, sortable: false },
  { key: 'city', label: 'City', width: 100, minWidth: 80, visible: true, sortable: false },
  { key: 'country', label: 'Country', width: 100, minWidth: 80, visible: true, sortable: false },
  { key: 'status', label: 'Status', width: 110, minWidth: 90, visible: true, sortable: false },
  { key: 'totalDeals', label: 'Total Deals', width: 100, minWidth: 80, visible: true, sortable: false },
  { key: 'totalVolume', label: 'Total Volume', width: 110, minWidth: 90, visible: true, sortable: false },
  { key: 'createdAt', label: 'Created At', width: 150, minWidth: 110, visible: true, sortable: false },
];
