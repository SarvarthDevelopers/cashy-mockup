import { useState, useMemo, useCallback, useEffect } from 'react';
import { MOCK_DEALS, SHOP_METADATA } from '../data/mockDeals';
import type { Deal } from '../data/mockDeals';
import { DealsToolbar } from '../components/Deals/DealsToolbar';
import { DealsFilterRail, INITIAL_FILTERS } from '../components/Deals/DealsFilterRail';
import type { FilterState } from '../components/Deals/DealsFilterRail';
import { DealsTable, DEFAULT_COLUMNS } from '../components/Deals/DealsTable';
import type { SortConfig, ColumnDef } from '../components/Deals/DealsTable';
import type { DealData } from '../data/mockData';
import { getBusinessAreaForDeal } from '../data/businessAreaMapping';
import { ExtendDealModal } from '../components/ExtendDealModal/ExtendDealModal';
import { PaybackDealModal } from '../components/PaybackDealModal/PaybackDealModal';

// Apply filters to deals dataset
function applyFilters(deals: Deal[], filters: FilterState): Deal[] {
  return deals.filter(deal => {
    if (filters.company.length > 0 && !filters.company.includes(deal.company)) return false;
    if (filters.branch.length > 0 && !filters.branch.includes(deal.branch)) return false;
    if (filters.shop.length > 0 && !filters.shop.includes(deal.shop)) return false;
    if (filters.businessArea.length > 0 && !filters.businessArea.includes(deal.businessArea)) return false;
    if (filters.categoryPaths.length > 0 && !deal.items.some(item => filters.categoryPaths.includes(item.category))) return false;
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
      let aVal: number | string;
      let bVal: number | string;

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

      const cmp = (typeof aVal === 'number' && typeof bVal === 'number')
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
    'Business Area', 'Customer First Name', 'Customer Last Name',
    'Customer Email', 'Customer Phone', 'Primary Item', 'Items Count',
    'Total Market Value', 'Total Requested Payout', 'Suggested Payout',
    'Duration (days)', 'Due Date', 'Created At', 'Labels', 'Priority',
    'Is Extension', 'Pickup Type', 'Has Missing Docs', 'Assigned To',
    'Column', 'Notes'
  ];

  const rows = deals.map(d => [
    d.dealId, d.mode, d.status, d.company, d.branch, d.shop,
    d.businessArea, d.primaryCustomer.firstName, d.primaryCustomer.lastName,
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
  const fallbackArea = getBusinessAreaForDeal(deal.items);
  const fallbackCategory = deal.items?.[0]?.category || 'General';
  const fallbackItemTitle = deal.items?.[0]?.title || 'Pawn Collateral';

  return {
    id: deal.dealId || 'CSY-UNKNOWN',
    status: deal.status,
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
    pickupType: deal.pickupType,
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
}

export function DealsPage({ onSelectDeal }: DealsPageProps) {
  // Master state
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfigs, setSortConfigs] = useState<SortConfig[]>([{ key: 'createdAt', direction: 'desc' }]);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [columns, setColumns] = useState<ColumnDef[]>(DEFAULT_COLUMNS);
  
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [filterCollapsed, setFilterCollapsed] = useState(false);
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Extend Deal Modal State
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [dealToExtend, setDealToExtend] = useState<DealData | null>(null);

  // Payback Deal Modal State
  const [isPaybackModalOpen, setIsPaybackModalOpen] = useState(false);
  const [dealToPayback, setDealToPayback] = useState<DealData | null>(null);



  // Redesign Action Progress variables
  const [exportStatus, setExportStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [exportProgress, setExportProgress] = useState(0);

  const [bulkActionStatus, setBulkActionStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [bulkErrorMessage, setBulkErrorMessage] = useState('');

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Responsive device view detection
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

  // Dynamic in-memory deal cache with real-time business area evaluation
  const [allDeals, setAllDeals] = useState<Deal[]>(() => {
    return MOCK_DEALS.map(deal => ({
      ...deal,
      businessArea: getBusinessAreaForDeal(deal.items) as unknown as Deal['businessArea']
    }));
  });

  useEffect(() => {
    const handleUpdate = () => {
      setAllDeals(MOCK_DEALS.map(deal => ({
        ...deal,
        businessArea: getBusinessAreaForDeal(deal.items) as unknown as Deal['businessArea']
      })));
    };
    window.addEventListener('cashy_business_areas_updated', handleUpdate);
    return () => window.removeEventListener('cashy_business_areas_updated', handleUpdate);
  }, []);

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
    filters.businessArea.forEach(v => pills.push({ category: 'Area', value: v, onClear: () => updateFilter('businessArea', filters.businessArea.filter(x => x !== v)) }));
    filters.mode.forEach(v => pills.push({ category: 'Type', value: v === 'custom_deal' ? 'Purchase' : 'Pawn', onClear: () => updateFilter('mode', filters.mode.filter(x => x !== v)) }));
    filters.status.forEach(v => pills.push({ category: 'Status', value: v.replace('_', ' '), onClear: () => updateFilter('status', filters.status.filter(x => x !== v)) }));
    filters.pickupType.forEach(v => pills.push({ category: 'Pickup', value: v, onClear: () => updateFilter('pickupType', filters.pickupType.filter(x => x !== v)) }));
    if (filters.createdDateFrom) pills.push({ category: 'From', value: filters.createdDateFrom, onClear: () => updateFilter('createdDateFrom', '') });
    if (filters.createdDateTo) pills.push({ category: 'To', value: filters.createdDateTo, onClear: () => updateFilter('createdDateTo', '') });
    if (filters.minSuggestedPayout) pills.push({ category: 'Min', value: `€${filters.minSuggestedPayout}`, onClear: () => updateFilter('minSuggestedPayout', '') });
    if (filters.maxSuggestedPayout) pills.push({ category: 'Max', value: `€${filters.maxSuggestedPayout}`, onClear: () => updateFilter('maxSuggestedPayout', '') });
    filters.categoryPaths.forEach(v => pills.push({ category: 'Category', value: v, onClear: () => updateFilter('categoryPaths', filters.categoryPaths.filter(x => x !== v)) }));

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

  const handleOpenWizard = useCallback((deal: Deal) => {
    const dealData = mapDealToDealData(deal);
    onSelectDeal(dealData);
  }, [onSelectDeal]);

  const handleRowClick = useCallback((deal: Deal) => {
    setActiveDeal(deal);
    handleOpenWizard(deal);
  }, [handleOpenWizard]);

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



  const handleExportAll = useCallback(() => {
    if (selectedRows.size > 0) {
      const selectedDeals = allDeals.filter(d => selectedRows.has(d.dealId));
      triggerSimulatedExport(selectedDeals, `cashy-deals-selected-${selectedRows.size}-items.csv`);
    } else {
      triggerSimulatedExport(filteredDeals, 'cashy-deals-filtered.csv');
    }
  }, [selectedRows, allDeals, filteredDeals, triggerSimulatedExport]);

  // Bulk simulated appraiser assignment with error triggers
  const executeBulkAction = useCallback((actionType: string) => {
    setBulkActionStatus('processing');
    setBulkErrorMessage('');

    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
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

  const handleBulkArchive = useCallback(() => executeBulkAction('archive'), [executeBulkAction]);



  const handleRowAction = useCallback((action: string, deal: Deal) => {
    if (action === 'open') {
      handleOpenWizard(deal);
    } else if (action === 'extend') {
      const dealData = mapDealToDealData(deal);
      setDealToExtend(dealData);
      setIsExtendModalOpen(true);
    } else if (action === 'payback') {
      const dealData = mapDealToDealData(deal);
      setDealToPayback(dealData);
      setIsPaybackModalOpen(true);

    } else if (action === 'archive') {
      executeBulkAction('archive');
    } else if (action === 'export') {
      triggerSimulatedExport([deal], `cashy-deal-${deal.dealId}.csv`);
    }
  }, [handleOpenWizard, triggerSimulatedExport, executeBulkAction]);

  const handleExtendDealUpdate = useCallback((updatedDealData: DealData) => {
    setAllDeals(prevDeals => prevDeals.map(d => {
      if (d.dealId === updatedDealData.id) {
        return {
          ...d,
          status: 'EXTENSION_CONFIRMED' as Deal['status'],
          isExtension: true,
          dueDate: updatedDealData.dueDate || d.dueDate,
          suggestedPayout: parseFloat(
            (updatedDealData.amount || '0').replace(/[€\s.]/g, '').replace(',', '.')
          ) || d.suggestedPayout,
          // Store full metadata in notes for display + revert
          notes: updatedDealData.specialNote || d.notes,
        };
      }
      return d;
    }));
  }, []);

  const handlePaybackDealUpdate = useCallback((updatedDealData: DealData) => {
    setAllDeals(prevDeals => prevDeals.map(d => {
      if (d.dealId === updatedDealData.id) {
        let newStatus: Deal['status'] = 'CLOSED';
        if (updatedDealData.specialNote?.startsWith('PAYBACK_META:')) {
          try {
            const meta = JSON.parse(updatedDealData.specialNote.replace('PAYBACK_META:', ''));
            const isOnlinePayment = !['Cash', 'Debit/Credit Card'].includes(meta.paymentType);
            const isShipmentOrLockbox = d.pickupType === 'STANDARD_SHIPMENT' || d.pickupType === 'STOREBOX';
            if (isOnlinePayment && isShipmentOrLockbox && meta.itemsRemovedFromStorage) {
              newStatus = 'PAYED_SHIPMENT_PENDING';
            }
          } catch { /* use default CLOSED */ }
        }
        return {
          ...d,
          status: newStatus,
          notes: updatedDealData.specialNote || d.notes,
        };
      }
      return d;
    }));
    setActiveDeal(prev => prev?.dealId === updatedDealData.id ? null : prev);
  }, []);



  if (isLoading) {
    return (
      <div className="bg-[var(--background-tertiary)] h-full w-full overflow-hidden flex flex-col font-['Inter',sans-serif] animate-pulse select-none">
        <div className="flex-1 min-h-0 flex flex-col px-3 py-3 md:px-6 md:py-4 gap-4">
          {/* Toolbar Skeleton */}
          <div className="h-14 bg-white border border-[var(--border-subtle)] rounded-xl flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-9 w-40 bg-gray-100 rounded-lg" />
              <div className="h-5 w-24 bg-gray-100 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-9 w-20 bg-gray-100 rounded-lg" />
              <div className="h-9 w-24 bg-gray-100 rounded-lg" />
            </div>
          </div>

          {/* Main Grid Viewport Skeleton */}
          <div className="flex gap-4 flex-1 min-h-0 relative">
            {/* Sidebar Filter Rail Skeleton */}
            <div className="w-[280px] bg-white border border-[var(--border-subtle)] rounded-2xl p-4 flex flex-col gap-6 shrink-0 h-full">
              <div className="h-5 w-28 bg-gray-100 rounded" />
              {[1, 2, 3, 4].map(idx => (
                <div className="flex flex-col gap-2" key={idx}>
                  <div className="h-4 w-20 bg-gray-100 rounded" />
                  <div className="h-9 w-full bg-gray-50 border border-gray-100 rounded-lg" />
                </div>
              ))}
            </div>

            {/* Spreadsheet Table Skeleton */}
            <div className="flex-1 bg-white border border-[var(--border-subtle)] rounded-2xl flex flex-col h-full overflow-hidden">
              {/* Table Header */}
              <div className="h-10 bg-gray-50 border-b border-gray-100 flex items-center px-4 justify-between shrink-0">
                {[1, 2, 3, 4, 5].map(idx => (
                  <div key={idx} className="h-4 w-24 bg-gray-200 rounded" />
                ))}
              </div>
              {/* Table Rows */}
              <div className="flex-1 flex flex-col gap-0.5 p-1 overflow-hidden">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(rowIdx => (
                  <div key={rowIdx} className="h-12 border-b border-gray-50 flex items-center px-3 justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 bg-gray-100 rounded" />
                      <div className="h-4 w-16 bg-gray-100 rounded" />
                    </div>
                    <div className="h-4 w-32 bg-gray-100 rounded" />
                    <div className="h-4 w-20 bg-gray-100 rounded" />
                    <div className="h-4 w-24 bg-gray-100 rounded" />
                    <div className="h-5 w-16 bg-gray-100 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--background-tertiary)] h-full w-full overflow-hidden flex flex-col font-['Inter',sans-serif] animate-in fade-in duration-500">
      {/* Page content */}
      <div className="flex-1 min-h-0 flex flex-col px-3 py-3 md:px-6 md:py-4">
        {/* Toolbar redone */}
        <DealsToolbar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          totalResults={filteredDeals.length}
          selectedCount={selectedRows.size}
          onBulkArchive={handleBulkArchive}
          onExportAll={handleExportAll}
          onClearSelection={() => setSelectedRows(new Set())}
          // Progress parameters
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

          {/* Spreadsheet table */}
          <div className="flex-1 min-w-0 h-full flex flex-col">
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
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              columns={columns}
              onColumnsChange={setColumns}
            />
          </div>

          {/* Extend Deal Modal */}
          <ExtendDealModal
            isOpen={isExtendModalOpen}
            onClose={() => {
              setIsExtendModalOpen(false);
              setDealToExtend(null);
            }}
            dealData={dealToExtend || undefined}
            onUpdateDeal={handleExtendDealUpdate}
          />

          <PaybackDealModal
            key={dealToPayback?.id ? `payback-${dealToPayback.id}` : 'payback-closed'}
            isOpen={isPaybackModalOpen}
            onClose={() => {
              setIsPaybackModalOpen(false);
              setDealToPayback(null);
            }}
            dealData={dealToPayback || undefined}
            onUpdateDeal={handlePaybackDealUpdate}
          />


        </div>
      </div>
    </div>
  );
}
