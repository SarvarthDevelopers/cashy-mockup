import type { ColumnDef } from './ItemsTable';

export const DEFAULT_COLUMNS: ColumnDef[] = [
  { key: 'itemId', label: 'Item ID', width: 90, minWidth: 80, visible: true, sortable: true },
  { key: 'title', label: 'Title', width: 140, minWidth: 100, visible: true, sortable: true },
  { key: 'category', label: 'Category Path', width: 160, minWidth: 120, visible: true, sortable: true },
  { key: 'businessArea', label: 'Business Area', width: 110, minWidth: 90, visible: true, sortable: true },
  { key: 'variant', label: 'Variant', width: 130, minWidth: 100, visible: true, sortable: true },
  { key: 'marketValue', label: 'Market Value', width: 100, minWidth: 80, visible: true, sortable: true },
  { key: 'payout', label: 'Payout', width: 95, minWidth: 70, visible: true, sortable: true },
  { key: 'dealId', label: 'Deal ID', width: 90, minWidth: 80, visible: true, sortable: true },
  { key: 'dealStatus', label: 'Deal Status', width: 125, minWidth: 95, visible: true, sortable: true },
  { key: 'hasImages', label: 'Images', width: 70, minWidth: 60, visible: true, sortable: true },
  { key: 'hasDocuments', label: 'Docs', width: 70, minWidth: 60, visible: true, sortable: true },
];
