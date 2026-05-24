import { useState, useMemo, useCallback, useEffect } from 'react';
import { MOCK_DEALS } from '../data/mockDeals';
import type { Deal } from '../data/mockDeals';
import { getBusinessAreaForItem } from '../data/businessAreaMapping';
import { ItemsToolbar } from '../components/Items/ItemsToolbar';
import { ItemsFilterRail, INITIAL_FILTERS } from '../components/Items/ItemsFilterRail';
import type { FilterState } from '../components/Items/ItemsFilterRail';
import { ItemsTable, DEFAULT_COLUMNS } from '../components/Items/ItemsTable';
import type { SortConfig, ColumnDef, FlatItem } from '../components/Items/ItemsTable';
import type { DealData } from '../data/mockData';

// Helper to determine deterministic booleans for missing data
function getDeterministicBoolean(seed: string, salt: string): boolean {
  let hash = 0;
  const str = seed + salt;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash % 2 === 0;
}

// Map Deal to DealData for Wizard compatibility
function mapDealToDealData(deal: Deal): DealData {
  const isDE = deal.company === 'CASHY_DE';
  const countryCode = isDE ? 'DE' : 'AT';
  const companyName = isDE ? 'Germany (DE)' : 'Austria (AT)';
  
  const payoutAmount = deal.suggestedPayout || 0;
  const totalAmountStr = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(payoutAmount);

  const fallbackCustomerName = `${deal.primaryCustomer?.firstName || 'Valued'} ${deal.primaryCustomer?.lastName || 'Customer'}`;
  const fallbackEmail = deal.primaryCustomer?.email || 'pawn-admin@cashy.at';
  const fallbackPhone = deal.primaryCustomer?.phone || '+43 (0) 1 361999';
  const fallbackBranch = deal.branch || 'Vienna HQ';
  const fallbackArea = deal.businessArea || 'General';
  const fallbackCategory = deal.items?.[0]?.category || 'General';
  const fallbackItemTitle = deal.items?.[0]?.title || 'Pawn Collateral';

  return {
    id: deal.dealId || 'CSY-UNKNOWN',
    countryCode,
    firstName: deal.primaryCustomer?.firstName || '—',
    lastName: deal.primaryCustomer?.lastName || '—',
    amount: totalAmountStr,
    dueDate: deal.dueDate || '—',
    items: deal.items ? deal.items.map(item => item.title) : ['Pawn Item'],
    branch: fallbackBranch,
    dealType: deal.mode === 'custom_deal' ? 'Purchase' : 'Pawn',
    businessArea: fallbackArea,
    flags: deal.hasMissingDocs ? ['Missing Docs'] : [],
    specialNote: deal.notes || '',
    wizardData: {
      customerName: fallbackCustomerName,
      email: fallbackEmail,
      phone: fallbackPhone,
      branch: fallbackBranch,
      company: companyName,
      businessArea: fallbackArea,
      categoryPath: `${fallbackArea} > ${fallbackCategory}`,
      dealDuration: `${deal.durationDays || 30} days remaining`,
      payoutType: deal.mode === 'custom_deal' ? 'Purchase' : 'Pawn',
      amount: totalAmountStr,
      item: fallbackItemTitle
    }
  };
}

// Filtering logic
function applyFilters(items: FlatItem[], filters: FilterState): FlatItem[] {
  return items.filter(item => {
    if (filters.itemId && !item.itemId.toLowerCase().includes(filters.itemId.toLowerCase())) return false;
    if (filters.dealId && !item.dealId.toLowerCase().includes(filters.dealId.toLowerCase())) return false;
    
    if (filters.categoryPaths.length > 0) {
      const match = filters.categoryPaths.some(path => {
        return item.category === path || item.category.startsWith(path + '.');
      });
      if (!match) return false;
    }

    if (filters.businessAreas.length > 0 && !filters.businessAreas.includes(item.businessArea)) return false;
    if (filters.dealStatuses.length > 0 && !filters.dealStatuses.includes(item.dealStatus)) return false;

    if (filters.hasImages === 'yes' && !item.hasImages) return false;
    if (filters.hasImages === 'no' && item.hasImages) return false;

    if (filters.hasDocuments === 'yes' && !item.hasDocuments) return false;
    if (filters.hasDocuments === 'no' && item.hasDocuments) return false;

    return true;
  });
}

// Broad multi-field search mapping
function applySearch(items: FlatItem[], query: string): FlatItem[] {
  if (!query.trim()) return items;
  const q = query.toLowerCase().trim();
  return items.filter(item => {
    const searchFields = [
      item.itemId,
      item.title,
      item.category,
      item.businessArea,
      item.variant,
      item.dealId,
      item.dealStatus
    ];
    return searchFields.some(field => field.toLowerCase().includes(q));
  });
}

// Multi-column sorting
function applySort(items: FlatItem[], sortConfigs: SortConfig[]): FlatItem[] {
  if (sortConfigs.length === 0) return items;
  const sorted = [...items];
  sorted.sort((a, b) => {
    for (const config of sortConfigs) {
      const { key, direction } = config;
      let aVal: number | string;
      let bVal: number | string;

      switch (key) {
        case 'itemId':
          aVal = a.itemId;
          bVal = b.itemId;
          break;
        case 'title':
          aVal = a.title;
          bVal = b.title;
          break;
        case 'category':
          aVal = a.category;
          bVal = b.category;
          break;
        case 'businessArea':
          aVal = a.businessArea;
          bVal = b.businessArea;
          break;
        case 'variant':
          aVal = a.variant;
          bVal = b.variant;
          break;
        case 'marketValue':
          aVal = a.marketValue;
          bVal = b.marketValue;
          break;
        case 'payout':
          aVal = a.requestedPayout;
          bVal = b.requestedPayout;
          break;
        case 'dealId':
          aVal = a.dealId;
          bVal = b.dealId;
          break;
        case 'dealStatus':
          aVal = a.dealStatus;
          bVal = b.dealStatus;
          break;
        case 'hasImages':
          aVal = a.hasImages ? 1 : 0;
          bVal = b.hasImages ? 1 : 0;
          break;
        case 'hasDocuments':
          aVal = a.hasDocuments ? 1 : 0;
          bVal = b.hasDocuments ? 1 : 0;
          break;
        default:
          continue;
      }

      if (aVal === bVal) continue;

      const cmp = (typeof aVal === 'number' && typeof bVal === 'number')
        ? aVal - bVal
        : String(aVal).localeCompare(String(bVal));

      if (cmp !== 0) return direction === 'asc' ? cmp : -cmp;
    }
    return 0;
  });
  return sorted;
}

// Export items list as spreadsheet CSV
function exportToCSV(items: FlatItem[], filename = 'cashy-items-export.csv') {
  const headers = [
    'Item ID', 'Title', 'Category Path', 'Business Area', 'Variant',
    'Market Value', 'Payout (Requested)', 'Deal ID', 'Deal Status',
    'Has Images', 'Has Documents'
  ];

  const rows = items.map(i => [
    i.itemId, i.title, i.category, i.businessArea, i.variant,
    i.marketValue, i.requestedPayout, i.dealId, i.dealStatus,
    i.hasImages ? 'Yes' : 'No', i.hasDocuments ? 'Yes' : 'No'
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

interface ItemsPageProps {
  onSelectDeal: (deal: DealData) => void;
}

export function ItemsPage({ onSelectDeal }: ItemsPageProps) {
  // Master states
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfigs, setSortConfigs] = useState<SortConfig[]>([{ key: 'itemId', direction: 'asc' }]);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [columns, setColumns] = useState<ColumnDef[]>(DEFAULT_COLUMNS);
  
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [filterCollapsed, setFilterCollapsed] = useState(false);
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Redesign Action Progress variables
  const [exportStatus, setExportStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [exportProgress, setExportProgress] = useState(0);

  const [bulkActionStatus, setBulkActionStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [bulkErrorMessage, setBulkErrorMessage] = useState('');

  // Mobile layout responsiveness
  useEffect(() => {
    const handleMobileResize = () => {
      if (window.innerWidth < 768) {
        setFilterCollapsed(true);
      }
    };
    handleMobileResize();
    window.addEventListener('resize', handleMobileResize);
    return () => window.removeEventListener('resize', handleMobileResize);
  }, []);

  // Flatten and enrich items from MOCK_DEALS on mount & settings mapping changes
  const allItems = useMemo(() => {
    const list: FlatItem[] = [];
    MOCK_DEALS.forEach((deal: Deal) => {
      deal.items.forEach((item) => {
        const businessArea = getBusinessAreaForItem(item.category);
        const itemId = item.itemId || `${deal.dealId}-item-${item.title}`;
        
        list.push({
          itemId,
          title: item.title || '—',
          category: item.category || 'other',
          businessArea,
          variant: item.variant || '',
          marketValue: item.marketValue || 0,
          requestedPayout: item.requestedPayout || 0,
          dealId: deal.dealId,
          dealStatus: deal.status,
          hasImages: getDeterministicBoolean(itemId, 'images'),
          hasDocuments: getDeterministicBoolean(itemId, 'docs'),
          parentDeal: deal
        });
      });
    });
    return list;
  }, []);

  // Active pills for toolbar
  const activePills = useMemo(() => {
    const pills: Array<{ category: string; value: string; onClear: () => void }> = [];
    const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFilters(prev => ({ ...prev, [key]: value }));
      setCurrentPage(1);
    };

    if (filters.itemId) pills.push({ category: 'Item ID', value: filters.itemId, onClear: () => updateFilter('itemId', '') });
    if (filters.dealId) pills.push({ category: 'Deal ID', value: filters.dealId, onClear: () => updateFilter('dealId', '') });
    
    filters.categoryPaths.forEach(v => {
      const displayVal = v.split('.').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' > ');
      pills.push({ 
        category: 'Category', 
        value: displayVal, 
        onClear: () => updateFilter('categoryPaths', filters.categoryPaths.filter(x => x !== v)) 
      });
    });

    filters.businessAreas.forEach(v => pills.push({ category: 'Area', value: v, onClear: () => updateFilter('businessAreas', filters.businessAreas.filter(x => x !== v)) }));
    filters.dealStatuses.forEach(v => pills.push({ category: 'Status', value: v.replace('_', ' '), onClear: () => updateFilter('dealStatuses', filters.dealStatuses.filter(x => x !== v)) }));
    
    if (filters.hasImages !== 'all') pills.push({ category: 'Images', value: filters.hasImages, onClear: () => updateFilter('hasImages', 'all') });
    if (filters.hasDocuments !== 'all') pills.push({ category: 'Docs', value: filters.hasDocuments, onClear: () => updateFilter('hasDocuments', 'all') });

    return pills;
  }, [filters]);

  // Combined filter + search + sort pipeline
  const filteredItems = useMemo(() => {
    let result = applyFilters(allItems, filters);
    result = applySearch(result, searchQuery);
    result = applySort(result, sortConfigs);
    return result;
  }, [allItems, filters, searchQuery, sortConfigs]);

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handleRowClick = useCallback((item: FlatItem) => {
    if (activeItemId === item.itemId) {
      setActiveItemId(null);
    } else {
      setActiveItemId(item.itemId);
    }
  }, [activeItemId]);

  // Simulated export stream
  const triggerSimulatedExport = useCallback((itemsToExport: FlatItem[], filename: string) => {
    setExportStatus('processing');
    setExportProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setExportProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        exportToCSV(itemsToExport, filename);
        setExportStatus('success');
        
        setTimeout(() => {
          setExportStatus('idle');
        }, 4000);
      }
    }, 250);
  }, []);

  const handleExportAll = useCallback(() => {
    if (selectedRows.size > 0) {
      const selectedItemsList = allItems.filter(i => selectedRows.has(i.itemId));
      triggerSimulatedExport(selectedItemsList, `cashy-items-selected-${selectedRows.size}.csv`);
    } else {
      triggerSimulatedExport(filteredItems, 'cashy-items-filtered.csv');
    }
  }, [selectedRows, allItems, filteredItems, triggerSimulatedExport]);

  // Simulated bulk action
  const executeBulkAction = useCallback((actionType: string) => {
    setBulkActionStatus('processing');
    setBulkErrorMessage('');
    
    // Check action type for future support
    if (actionType !== 'archive') {
      // noop
    }

    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      if (progress >= 100) {
        clearInterval(interval);
        
        setBulkActionStatus('success');
        setSelectedRows(new Set());
        setTimeout(() => setBulkActionStatus('idle'), 3000);
      }
    }, 200);
  }, []);

  const handleBulkArchive = useCallback(() => executeBulkAction('archive'), [executeBulkAction]);

  const handleOpenWizard = useCallback((deal: Deal) => {
    const dealData = mapDealToDealData(deal);
    onSelectDeal(dealData);
  }, [onSelectDeal]);

  const handleRowAction = useCallback((action: string, item: FlatItem) => {
    if (action === 'open') {
      handleOpenWizard(item.parentDeal);
    } else if (action === 'archive') {
      executeBulkAction('archive');
    } else if (action === 'export') {
      triggerSimulatedExport([item], `cashy-item-${item.itemId}.csv`);
    }
  }, [handleOpenWizard, triggerSimulatedExport, executeBulkAction]);

  return (
    <div className="bg-[var(--background-secondary)] h-full w-full overflow-hidden flex flex-col font-['Inter',sans-serif]">
      <div className="flex-1 min-h-0 flex flex-col px-3 py-3 md:px-6 md:py-4">
        
        {/* Toolbar */}
        <ItemsToolbar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          totalResults={filteredItems.length}
          selectedCount={selectedRows.size}
          onBulkArchive={handleBulkArchive}
          onExportAll={handleExportAll}
          onClearSelection={() => setSelectedRows(new Set())}
          bulkActionStatus={bulkActionStatus}
          bulkErrorMessage={bulkErrorMessage}
          onRetryBulk={() => executeBulkAction('archive')}
          exportStatus={exportStatus}
          exportProgress={exportProgress}
          onToggleFilter={() => setFilterCollapsed(!filterCollapsed)}
          activeFiltersCount={activePills.length}
          columns={columns}
          onColumnsChange={setColumns}
          activePills={activePills}
          onClearFilters={() => handleFiltersChange(INITIAL_FILTERS)}
        />

        {/* Layout containing Filter Sidebar and Spreadsheet Table */}
        <div className="flex gap-4 flex-1 min-h-0 mt-3 relative">
          <ItemsFilterRail
            filters={filters}
            onFiltersChange={handleFiltersChange}
            items={allItems}
            collapsed={filterCollapsed}
            onToggleCollapse={() => setFilterCollapsed(!filterCollapsed)}
          />

          <div className="flex-1 min-w-0 h-full flex flex-col">
            <ItemsTable
              items={filteredItems}
              sortConfigs={sortConfigs}
              onSortChange={setSortConfigs}
              selectedRows={selectedRows}
              onSelectionChange={setSelectedRows}
              onRowClick={handleRowClick}
              activeItemId={activeItemId}
              pageSize={pageSize}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              onRowAction={handleRowAction}
              onOpenWizard={handleOpenWizard}
              searchActive={!!searchQuery.trim()}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              columns={columns}
              onColumnsChange={setColumns}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
