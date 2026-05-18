import { useState, useMemo, useCallback, useEffect } from 'react';
import { MOCK_DEALS, SHOP_METADATA } from '../data/mockDeals';
import type { Deal } from '../data/mockDeals';
import { DealsToolbar } from '../components/Deals/DealsToolbar';
import { DealsFilterRail, INITIAL_FILTERS } from '../components/Deals/DealsFilterRail';
import type { FilterState } from '../components/Deals/DealsFilterRail';
import { DealsTable } from '../components/Deals/DealsTable';
import type { SortConfig } from '../components/Deals/DealsTable';
import { DealsPreviewPanel } from '../components/Deals/DealsPreviewPanel';
import { DealsCardView } from '../components/Deals/DealsCardView';
import type { DealData } from '../data/mockData';

// Apply filters to deals dataset
function applyFilters(deals: Deal[], filters: FilterState): Deal[] {
  return deals.filter(deal => {
    if (filters.company.length > 0 && !filters.company.includes(deal.company)) return false;
    if (filters.branch.length > 0 && !filters.branch.includes(deal.branch)) return false;
    if (filters.shop.length > 0 && !filters.shop.includes(deal.shop)) return false;
    if (filters.businessUnit.length > 0 && !filters.businessUnit.includes(deal.businessUnit)) return false;
    if (filters.businessArea.length > 0 && !filters.businessArea.includes(deal.businessArea)) return false;
    if (filters.mode.length > 0 && !filters.mode.includes(deal.mode)) return false;
    if (filters.status.length > 0 && !filters.status.includes(deal.status)) return false;
    if (filters.labels.length > 0 && !filters.labels.some(l => deal.labels.includes(l))) return false;
    if (filters.assignedTo.length > 0 && !filters.assignedTo.includes(deal.assignedTo)) return false;
    if (filters.pickupType.length > 0 && !filters.pickupType.includes(deal.pickupType)) return false;
    if (filters.hasMissingDocs === 'yes' && !deal.hasMissingDocs) return false;
    if (filters.hasMissingDocs === 'no' && deal.hasMissingDocs) return false;
    if (filters.isExtension === 'yes' && !deal.isExtension) return false;
    if (filters.isExtension === 'no' && deal.isExtension) return false;

    if (filters.createdDateFrom) {
      if (new Date(deal.createdAt) < new Date(filters.createdDateFrom)) return false;
    }
    if (filters.createdDateTo) {
      if (new Date(deal.createdAt) > new Date(filters.createdDateTo + 'T23:59:59')) return false;
    }
    if (filters.dueDateFrom) {
      if (new Date(deal.dueDate) < new Date(filters.dueDateFrom)) return false;
    }
    if (filters.dueDateTo) {
      if (new Date(deal.dueDate) > new Date(filters.dueDateTo)) return false;
    }

    if (filters.minSuggestedPayout) {
      if (deal.suggestedPayout < Number(filters.minSuggestedPayout)) return false;
    }
    if (filters.maxSuggestedPayout) {
      if (deal.suggestedPayout > Number(filters.maxSuggestedPayout)) return false;
    }

    return true;
  });
}

// Broad multi-field search mapping
function applySearch(deals: Deal[], query: string): Deal[] {
  if (!query.trim()) return deals;
  const q = query.toLowerCase().trim();
  return deals.filter(deal => {
    const searchFields = [
      deal.dealId,
      deal.primaryCustomer.firstName,
      deal.primaryCustomer.lastName,
      `${deal.primaryCustomer.firstName} ${deal.primaryCustomer.lastName}`,
      deal.primaryCustomer.email,
      deal.primaryCustomer.phone,
      ...deal.items.map(i => i.title),
      ...deal.items.map(i => i.variant),
      ...deal.items.map(i => i.category),
      deal.branch,
      deal.shop,
      deal.assignedTo,
      deal.company,
      deal.status,
      deal.businessArea,
      deal.businessUnit,
      ...deal.labels,
      deal.notes || '',
    ];
    return searchFields.some(field => field.toLowerCase().includes(q));
  });
}

// Multi-column sorting with client-side fallback sorting across all fields
function applySort(deals: Deal[], sortConfigs: SortConfig[]): Deal[] {
  if (sortConfigs.length === 0) return deals;
  const sorted = [...deals];
  sorted.sort((a, b) => {
    for (const config of sortConfigs) {
      const { key, direction } = config;
      let aVal: any;
      let bVal: any;

      switch (key) {
        case 'dealId': 
          aVal = a.dealId; 
          bVal = b.dealId; 
          break;
        case 'createdAt': 
          aVal = a.createdAt; 
          bVal = b.createdAt; 
          break;
        case 'mode': 
          aVal = a.mode; 
          bVal = b.mode; 
          break;
        case 'status': 
          aVal = a.status; 
          bVal = b.status; 
          break;
        case 'company': 
          aVal = a.company; 
          bVal = b.company; 
          break;
        case 'branch': 
          aVal = a.branch; 
          bVal = b.branch; 
          break;
        case 'businessArea': 
          aVal = a.businessArea; 
          bVal = b.businessArea; 
          break;
        case 'customer': 
          aVal = `${a.primaryCustomer.firstName} ${a.primaryCustomer.lastName}`; 
          bVal = `${b.primaryCustomer.firstName} ${b.primaryCustomer.lastName}`; 
          break;
        case 'suggestedPayout': 
          aVal = a.suggestedPayout; 
          bVal = b.suggestedPayout; 
          break;
        case 'totalRequestedPayout': 
          aVal = a.totalRequestedPayout; 
          bVal = b.totalRequestedPayout; 
          break;
        case 'totalMarketValue': 
          aVal = a.totalMarketValue; 
          bVal = b.totalMarketValue; 
          break;
        case 'assignedTo': 
          aVal = a.assignedTo; 
          bVal = b.assignedTo; 
          break;
        default: 
          continue;
      }

      if (aVal === bVal) continue;

      const cmp = typeof aVal === 'number'
        ? aVal - bVal
        : String(aVal).localeCompare(String(bVal));

      if (cmp !== 0) return direction === 'asc' ? cmp : -cmp;
    }
    return 0;
  });
  return sorted;
}

// Export formatted columns as spreadsheet CSV
function exportToCSV(deals: Deal[], filename = 'cashy-deals-export.csv') {
  const headers = [
    'Deal ID', 'Mode', 'Status', 'Company', 'Branch', 'Shop',
    'Business Unit', 'Business Area', 'Customer First Name', 'Customer Last Name',
    'Customer Email', 'Customer Phone', 'Primary Item', 'Items Count',
    'Total Market Value', 'Total Requested Payout', 'Suggested Payout',
    'Duration (days)', 'Due Date', 'Created At', 'Labels', 'Priority',
    'Is Extension', 'Pickup Type', 'Has Missing Docs', 'Assigned To',
    'Column', 'Notes'
  ];

  const rows = deals.map(d => [
    d.dealId, d.mode, d.status, d.company, d.branch, d.shop,
    d.businessUnit, d.businessArea, d.primaryCustomer.firstName, d.primaryCustomer.lastName,
    d.primaryCustomer.email, d.primaryCustomer.phone, d.items[0]?.title || '', d.items.length,
    d.totalMarketValue, d.totalRequestedPayout, d.suggestedPayout,
    d.durationDays, d.dueDate, d.createdAt, d.labels.join(';'), d.priority,
    d.isExtension, d.pickupType, d.hasMissingDocs, d.assignedTo,
    d.column, d.notes
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

// Dynamic Client Mapper (With Placeholders for Missing Keys)
function mapDealToDealData(deal: Deal): DealData {
  const isDE = deal.company === 'CASHY_DE';
  const countryCode = isDE ? 'DE' : 'AT';
  const companyName = isDE ? 'Germany (DE)' : 'Austria (AT)';
  
  // Safe calculation parameters
  const payoutAmount = deal.suggestedPayout || 0;
  const totalAmountStr = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(payoutAmount);

  // Safe fallback metadata
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

interface DealsPageProps {
  onSelectDeal: (deal: DealData) => void;
  onNewDealClick: () => void;
}

export function DealsPage({ onSelectDeal, onNewDealClick }: DealsPageProps) {
  // Master state
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfigs, setSortConfigs] = useState<SortConfig[]>([{ key: 'createdAt', direction: 'desc' }]);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [filterCollapsed, setFilterCollapsed] = useState(false);
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Redesign Action Progress variables
  const [exportStatus, setExportStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [exportProgress, setExportProgress] = useState(0);

  const [bulkActionStatus, setBulkActionStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkErrorMessage, setBulkErrorMessage] = useState('');

  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Responsive device view detection
  useEffect(() => {
    const handleMobileResize = () => {
      if (window.innerWidth < 768) {
        setViewMode('card');
        setFilterCollapsed(true);
      }
    };
    handleMobileResize();
    window.addEventListener('resize', handleMobileResize);
    return () => window.removeEventListener('resize', handleMobileResize);
  }, []);

  // Filtering + Searching logic coordination
  const allDeals = MOCK_DEALS;

  // Structured active filter pills for quick clearing
  const activePills = useMemo(() => {
    const pills: Array<{ category: string; value: string; onClear: () => void }> = [];
    const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFilters(prev => ({ ...prev, [key]: value }));
      setCurrentPage(1);
    };

    filters.company.forEach(v => pills.push({ category: 'Company', value: v, onClear: () => updateFilter('company', filters.company.filter(x => x !== v)) }));
    filters.branch.forEach(v => pills.push({ category: 'Branch', value: v, onClear: () => {
      const newBranches = filters.branch.filter(x => x !== v);
      const validShops = newBranches.flatMap(b => SHOP_METADATA[b] || []);
      const newShops = filters.shop.filter(s => validShops.includes(s));
      setFilters(prev => ({ ...prev, branch: newBranches, shop: newShops }));
      setCurrentPage(1);
    }}));
    filters.shop.forEach(v => pills.push({ category: 'Shop', value: v, onClear: () => updateFilter('shop', filters.shop.filter(x => x !== v)) }));
    filters.businessUnit.forEach(v => pills.push({ category: 'Unit', value: v, onClear: () => updateFilter('businessUnit', filters.businessUnit.filter(x => x !== v)) }));
    filters.businessArea.forEach(v => pills.push({ category: 'Area', value: v, onClear: () => updateFilter('businessArea', filters.businessArea.filter(x => x !== v)) }));
    filters.mode.forEach(v => pills.push({ category: 'Type', value: v === 'custom_deal' ? 'Purchase' : 'Pawn', onClear: () => updateFilter('mode', filters.mode.filter(x => x !== v)) }));
    filters.status.forEach(v => pills.push({ category: 'Status', value: v.replace('_', ' '), onClear: () => updateFilter('status', filters.status.filter(x => x !== v)) }));
    filters.pickupType.forEach(v => pills.push({ category: 'Pickup', value: v, onClear: () => updateFilter('pickupType', filters.pickupType.filter(x => x !== v)) }));
    if (filters.createdDateFrom) pills.push({ category: 'From', value: filters.createdDateFrom, onClear: () => updateFilter('createdDateFrom', '') });
    if (filters.createdDateTo) pills.push({ category: 'To', value: filters.createdDateTo, onClear: () => updateFilter('createdDateTo', '') });
    if (filters.minSuggestedPayout) pills.push({ category: 'Min', value: `€${filters.minSuggestedPayout}`, onClear: () => updateFilter('minSuggestedPayout', '') });
    if (filters.maxSuggestedPayout) pills.push({ category: 'Max', value: `€${filters.maxSuggestedPayout}`, onClear: () => updateFilter('maxSuggestedPayout', '') });

    return pills;
  }, [filters]);

  const filteredDeals = useMemo(() => {
    let result = applyFilters(allDeals, filters);
    result = applySearch(result, searchQuery);
    
    // Support client-side fallback sorting across all fields even during searches
    result = applySort(result, sortConfigs);
    return result;
  }, [allDeals, filters, searchQuery, sortConfigs]);

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  // Progressive simulated lazy loading for side previews
  const handleRowClick = useCallback((deal: Deal) => {
    if (activeDeal?.dealId === deal.dealId) {
      setActiveDeal(null);
      return;
    }
    
    setIsPreviewLoading(true);
    setActiveDeal(deal);
    
    const loader = setTimeout(() => {
      setIsPreviewLoading(false);
    }, 350);

    return () => clearTimeout(loader);
  }, [activeDeal]);

  // Dynamic simulated CSV Stream export progress
  const triggerSimulatedExport = useCallback((dealsToExport: Deal[], filename: string) => {
    setExportStatus('processing');
    setExportProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setExportProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        exportToCSV(dealsToExport, filename);
        setExportStatus('success');
        
        // Success notification clear timeout
        setTimeout(() => {
          setExportStatus('idle');
        }, 4000);
      }
    }, 250);
  }, []);

  const handleBulkExport = useCallback(() => {
    const selected = allDeals.filter(d => selectedRows.has(d.dealId));
    triggerSimulatedExport(selected, 'cashy-deals-selected.csv');
  }, [allDeals, selectedRows, triggerSimulatedExport]);

  const handleExportAll = useCallback(() => {
    triggerSimulatedExport(filteredDeals, 'cashy-deals-all.csv');
  }, [filteredDeals, triggerSimulatedExport]);

  // Bulk simulated appraiser assignment with error triggers
  const executeBulkAction = useCallback((actionType: string) => {
    setBulkActionStatus('processing');
    setBulkProgress(0);
    setBulkErrorMessage('');

    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      setBulkProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);

        // Simulate a minor validation warning (some selected deals had missing docs)
        const hasFlagsSelected = Array.from(selectedRows).some(id => {
          const deal = allDeals.find(d => d.dealId === id);
          return deal?.hasMissingDocs;
        });

        if (hasFlagsSelected && actionType === 'assign') {
          setBulkActionStatus('error');
          setBulkErrorMessage('Assign failed on 1 deal: Missing owner documents flagged.');
        } else {
          setBulkActionStatus('success');
          setSelectedRows(new Set());
          setTimeout(() => setBulkActionStatus('idle'), 3000);
        }
      }
    }, 200);
  }, [selectedRows, allDeals]);

  const handleBulkAssign = useCallback(() => executeBulkAction('assign'), [executeBulkAction]);
  const handleBulkArchive = useCallback(() => executeBulkAction('archive'), [executeBulkAction]);

  const handleOpenWizard = useCallback((deal: Deal) => {
    const dealData = mapDealToDealData(deal);
    onSelectDeal(dealData);
  }, [onSelectDeal]);

  const handleRowAction = useCallback((action: string, deal: Deal) => {
    if (action === 'open') {
      handleOpenWizard(deal);
    } else if (action === 'archive') {
      executeBulkAction('archive');
    } else if (action === 'export') {
      triggerSimulatedExport([deal], `cashy-deal-${deal.dealId}.csv`);
    }
  }, [handleOpenWizard, triggerSimulatedExport, executeBulkAction]);

  return (
    <div className="bg-[var(--background-secondary)] h-full w-full overflow-hidden flex flex-col font-['Inter',sans-serif]">
      {/* Page content */}
      <div className="flex-1 min-h-0 flex flex-col px-6 py-4">
        {/* Toolbar redone */}
        <DealsToolbar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalResults={filteredDeals.length}
          selectedCount={selectedRows.size}
          onBulkAssign={handleBulkAssign}
          onBulkArchive={handleBulkArchive}
          onBulkExport={handleBulkExport}
          onNewDeal={onNewDealClick}
          onExportAll={handleExportAll}
          onClearSelection={() => setSelectedRows(new Set())}
          // Progress parameters
          bulkActionStatus={bulkActionStatus}
          bulkProgress={bulkProgress}
          bulkErrorMessage={bulkErrorMessage}
          onRetryBulk={() => executeBulkAction('assign')}
          exportStatus={exportStatus}
          exportProgress={exportProgress}
        />

        {/* Main Grid Viewport */}
        <div className="flex gap-4 flex-1 min-h-0 mt-3 relative">
          {/* Collapsible Filter Sidebar Drawer */}
          <DealsFilterRail
            filters={filters}
            onFiltersChange={handleFiltersChange}
            deals={allDeals}
            collapsed={filterCollapsed}
            onToggleCollapse={() => setFilterCollapsed(!filterCollapsed)}
          />

          {/* Spreadsheet table or visual Card modes */}
          <div className="flex-1 min-w-0 h-full flex flex-col">
            {viewMode === 'table' ? (
              <DealsTable
                deals={filteredDeals}
                sortConfigs={sortConfigs}
                onSortChange={setSortConfigs}
                selectedRows={selectedRows}
                onSelectionChange={setSelectedRows}
                onRowClick={handleRowClick}
                activeDealId={activeDeal?.dealId || null}
                pageSize={pageSize}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                onRowAction={handleRowAction}
                searchActive={!!searchQuery.trim()}
                filters={filters}
                onFiltersChange={handleFiltersChange}
                activePills={activePills}
              />
            ) : (
              <DealsCardView
                deals={filteredDeals}
                selectedRows={selectedRows}
                onSelectionChange={setSelectedRows}
                onRowClick={handleRowClick}
                activeDealId={activeDeal?.dealId || null}
                pageSize={pageSize}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
              />
            )}
          </div>

          {/* Progressive slide-in timeline preview */}
          {activeDeal && (
            <DealsPreviewPanel
              deal={activeDeal}
              isLoading={isPreviewLoading}
              onClose={() => setActiveDeal(null)}
              onOpenWizard={handleOpenWizard}
            />
          )}
        </div>
      </div>
    </div>
  );
}
