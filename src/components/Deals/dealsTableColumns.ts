import type { ColumnDef } from './DealsTable';

export const DEFAULT_COLUMNS: ColumnDef[] = [
  { key: 'dealId', label: 'Deal ID', width: 100, minWidth: 80, visible: true, sortable: true },
  { key: 'customer', label: 'Customer', width: 140, minWidth: 110, visible: true, sortable: true },
  { key: 'primaryItem', label: 'Primary Item', width: 150, minWidth: 120, visible: true, sortable: true },
  { key: 'payout', label: 'Payout', width: 100, minWidth: 80, visible: true, sortable: true },
  { key: 'businessArea', label: 'Business Area', width: 100, minWidth: 80, visible: true, sortable: true },
  { key: 'durationDays', label: 'Duration', width: 80, minWidth: 60, visible: true, sortable: true },
  { key: 'createdAt', label: 'Created', width: 100, minWidth: 80, visible: true, sortable: true },
  { key: 'status', label: 'Status', width: 125, minWidth: 90, visible: false, sortable: true },
  { key: 'company', label: 'Company', width: 70, minWidth: 60, visible: false, sortable: true },
  { key: 'branch', label: 'Branch / Shop', width: 140, minWidth: 120, visible: true, sortable: true },
  { key: 'pickupType', label: 'Pickup', width: 100, minWidth: 80, visible: false, sortable: true },
];
