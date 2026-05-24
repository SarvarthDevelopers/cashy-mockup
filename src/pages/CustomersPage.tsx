import { useState, useMemo, useCallback, useEffect } from 'react';
import { MOCK_CUSTOMERS } from '../data/mockCustomers';
import type { Customer } from '../data/mockCustomers';
import type { Deal } from '../data/mockDeals';
import type { DealData } from '../data/mockData';
import { CustomersToolbar } from '../components/Customers/CustomersToolbar';
import { CustomersFilterRail } from '../components/Customers/CustomersFilterRail';
import { INITIAL_FILTERS, type FilterState } from '../components/Customers/customersFilterConstants';
import { CustomersTable } from '../components/Customers/CustomersTable';
import { DEFAULT_COLUMNS, type ColumnDef } from '../components/Customers/customersTableColumns';
import { CustomersPreviewPanel } from '../components/Customers/CustomersPreviewPanel';
import { AnimatePresence } from 'motion/react';

interface CustomersPageProps {
  onSelectDeal: (dealData: DealData) => void;
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
function applyFilters(customers: Customer[], filters: FilterState): Customer[] {
  return customers.filter(c => {
    if (filters.customerId && !c.customerId.toLowerCase().includes(filters.customerId.toLowerCase())) return false;
    
    if (filters.countries.length > 0 && !filters.countries.includes(c.country)) return false;
    if (filters.cities.length > 0 && !filters.cities.includes(c.city)) return false;
    if (filters.statuses.length > 0 && !filters.statuses.includes(c.status)) return false;

    if (filters.minDeals && c.totalDeals < Number(filters.minDeals)) return false;
    if (filters.maxDeals && c.totalDeals > Number(filters.maxDeals)) return false;

    if (filters.minVolume && c.totalVolume < Number(filters.minVolume)) return false;
    if (filters.maxVolume && c.totalVolume > Number(filters.maxVolume)) return false;

    if (filters.createdDateFrom && new Date(c.createdAt) < new Date(filters.createdDateFrom)) return false;
    if (filters.createdDateTo && new Date(c.createdAt) > new Date(filters.createdDateTo)) return false;

    return true;
  });
}

// Search filter mapping
function applySearch(customers: Customer[], query: string): Customer[] {
  if (!query.trim()) return customers;
  const q = query.toLowerCase().trim();
  return customers.filter(c => {
    const searchFields = [
      c.customerId,
      c.firstName,
      c.lastName,
      `${c.firstName} ${c.lastName}`,
      c.email,
      c.phone,
      c.city,
      c.country,
      c.status
    ];
    return searchFields.some(field => field.toLowerCase().includes(q));
  });
}

// Export customers list as CSV
function exportToCSV(customers: Customer[], filename = 'cashy-customers-export.csv') {
  const headers = [
    'Customer ID', 'First Name', 'Last Name', 'Email', 'Phone',
    'City', 'Country', 'Status', 'Total Deals', 'Total Volume', 'Created At'
  ];

  const rows = customers.map(c => [
    c.customerId, c.firstName, c.lastName, c.email, c.phone,
    c.city, c.country, c.status, c.totalDeals, c.totalVolume, c.createdAt
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function CustomersPage({ onSelectDeal }: CustomersPageProps) {
  // Master customer state compiled dynamically on mount / updates
  const [allCustomers, setAllCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);

  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [activeCustomerId, setActiveCustomerId] = useState<string | null>(null);

  // Column Picker
  const [columns, setColumns] = useState<ColumnDef[]>(DEFAULT_COLUMNS);

  // Pagination
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Sidebar visibility
  const [filterCollapsed, setFilterCollapsed] = useState(false);

  // Bulk actions status
  const [bulkActionStatus, setBulkActionStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [bulkErrorMessage, setBulkErrorMessage] = useState('');

  // Export progress
  const [exportStatus, setExportStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [exportProgress, setExportProgress] = useState(0);

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

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

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  // Filtered and searched customer list
  const filteredCustomers = useMemo(() => {
    const stage1 = applyFilters(allCustomers, filters);
    return applySearch(stage1, searchQuery);
  }, [allCustomers, filters, searchQuery]);

  // Selected customer object for preview panel
  const activeCustomer = useMemo(() => {
    return allCustomers.find(c => c.customerId === activeCustomerId) || null;
  }, [allCustomers, activeCustomerId]);

  // Handle active filters count pills
  const activePills = useMemo(() => {
    const pills: Array<{ category: string; value: string; onClear: () => void }> = [];

    if (filters.customerId) {
      pills.push({
        category: 'ID',
        value: filters.customerId,
        onClear: () => setFilters(f => ({ ...f, customerId: '' }))
      });
    }

    filters.countries.forEach(country => {
      pills.push({
        category: 'Country',
        value: country,
        onClear: () => setFilters(f => ({ ...f, countries: f.countries.filter(c => c !== country) }))
      });
    });

    filters.cities.forEach(city => {
      pills.push({
        category: 'City',
        value: city,
        onClear: () => setFilters(f => ({ ...f, cities: f.cities.filter(c => c !== city) }))
      });
    });

    filters.statuses.forEach(status => {
      pills.push({
        category: 'Status',
        value: status,
        onClear: () => setFilters(f => ({ ...f, statuses: f.statuses.filter(s => s !== status) }))
      });
    });

    if (filters.minDeals || filters.maxDeals) {
      pills.push({
        category: 'Deals Count',
        value: `${filters.minDeals || '0'}-${filters.maxDeals || '∞'}`,
        onClear: () => setFilters(f => ({ ...f, minDeals: '', maxDeals: '' }))
      });
    }

    if (filters.minVolume || filters.maxVolume) {
      pills.push({
        category: 'Payout Volume',
        value: `${filters.minVolume || '0'}€-${filters.maxVolume || '∞'}€`,
        onClear: () => setFilters(f => ({ ...f, minVolume: '', maxVolume: '' }))
      });
    }

    if (filters.createdDateFrom || filters.createdDateTo) {
      pills.push({
        category: 'Created Date',
        value: `${filters.createdDateFrom || 'Start'} to ${filters.createdDateTo || 'End'}`,
        onClear: () => setFilters(f => ({ ...f, createdDateFrom: '', createdDateTo: '' }))
      });
    }

    return pills;
  }, [filters]);

  // CSV exporting simulated visual progression
  const triggerSimulatedExport = useCallback((data: Customer[], filename: string) => {
    setExportStatus('processing');
    setExportProgress(0);
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setExportProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        exportToCSV(data, filename);
        setExportStatus('success');
        setTimeout(() => setExportStatus('idle'), 1500);
      }
    }, 80);
  }, []);

  const handleExportAll = useCallback(() => {
    triggerSimulatedExport(filteredCustomers, 'cashy-customers-export.csv');
  }, [filteredCustomers, triggerSimulatedExport]);

  // Bulk action handler: Blacklist
  const executeBulkAction = useCallback((actionType: string) => {
    setBulkActionStatus('processing');
    setBulkErrorMessage('');

    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      if (progress >= 100) {
        clearInterval(interval);
        
        if (actionType === 'blacklist') {
          setAllCustomers(prev => prev.map(c => 
            selectedRows.has(c.customerId) ? { ...c, status: 'BLACKLISTED' as const } : c
          ));
        }
        
        setBulkActionStatus('success');
        setSelectedRows(new Set());
        setTimeout(() => setBulkActionStatus('idle'), 3000);
      }
    }, 150);
  }, [selectedRows]);

  const handleBulkBlacklist = useCallback(() => executeBulkAction('blacklist'), [executeBulkAction]);

  // Open the Deal Wizard modal
  const handleOpenWizard = useCallback((deal: Deal) => {
    const dealData = mapDealToDealData(deal);
    onSelectDeal(dealData);
  }, [onSelectDeal]);

  // Single-row updates / inline action triggers
  const handleRowAction = useCallback((action: string, targetCustomer: Customer) => {
    if (action === 'view') {
      setActiveCustomerId(targetCustomer.customerId);
    } else if (action === 'status-active') {
      setAllCustomers(prev => prev.map(c => c.customerId === targetCustomer.customerId ? { ...c, status: 'ACTIVE' } : c));
    } else if (action === 'status-inactive') {
      setAllCustomers(prev => prev.map(c => c.customerId === targetCustomer.customerId ? { ...c, status: 'INACTIVE' } : c));
    } else if (action === 'status-blacklist') {
      setAllCustomers(prev => prev.map(c => c.customerId === targetCustomer.customerId ? { ...c, status: 'BLACKLISTED' } : c));
    } else if (action === 'delete') {
      setAllCustomers(prev => prev.filter(c => c.customerId !== targetCustomer.customerId));
      if (activeCustomerId === targetCustomer.customerId) setActiveCustomerId(null);
    }
  }, [activeCustomerId]);

  const handleStatusChange = useCallback((customerId: string, status: Customer['status']) => {
    setAllCustomers(prev => prev.map(c => c.customerId === customerId ? { ...c, status } : c));
  }, []);

  const handleDeleteCustomer = useCallback((customerId: string) => {
    setAllCustomers(prev => prev.filter(c => c.customerId !== customerId));
    setActiveCustomerId(null);
  }, []);

  const handleRowClick = useCallback((c: Customer) => {
    if (activeCustomerId === c.customerId) setActiveCustomerId(null);
    else setActiveCustomerId(c.customerId);
  }, [activeCustomerId]);

  if (isLoading) {
    return (
      <div className="bg-[var(--background-tertiary)] h-full w-full overflow-hidden flex flex-col font-['Inter',sans-serif] animate-pulse select-none">
        <div className="flex-1 min-h-0 flex flex-col px-3 py-3 md:px-6 md:py-4 gap-4">
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
          <div className="flex gap-4 flex-1 min-h-0 relative">
            <div className="w-64 bg-white border border-[var(--border-subtle)] rounded-2xl p-4 flex flex-col gap-6 shrink-0 h-full">
              <div className="h-5 w-28 bg-gray-100 rounded" />
              {[1, 2, 3, 4].map(idx => (
                <div className="flex flex-col gap-2" key={idx}>
                  <div className="h-4 w-20 bg-gray-100 rounded" />
                  <div className="h-9 w-full bg-gray-50 border border-gray-100 rounded-lg" />
                </div>
              ))}
            </div>
            <div className="flex-1 bg-white border border-[var(--border-subtle)] rounded-2xl flex flex-col h-full overflow-hidden">
              <div className="h-10 bg-gray-50 border-b border-gray-100 flex items-center px-4 justify-between shrink-0">
                {[1, 2, 3, 4, 5].map(idx => (
                  <div key={idx} className="h-4 w-24 bg-gray-200 rounded" />
                ))}
              </div>
              <div className="flex-1 flex flex-col gap-0.5 p-1 overflow-hidden">
                {[1, 2, 3, 4, 5].map(rowIdx => (
                  <div key={rowIdx} className="h-12 border-b border-gray-50 flex items-center px-3 justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 bg-gray-100 rounded" />
                      <div className="h-4 w-16 bg-gray-100 rounded" />
                    </div>
                    <div className="h-4 w-32 bg-gray-100 rounded" />
                    <div className="h-4 w-20 bg-gray-100 rounded" />
                    <div className="h-4 w-24 bg-gray-100 rounded" />
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
      <div className="flex-1 min-h-0 flex flex-col px-3 py-3 md:px-6 md:py-4">
        
        {/* Toolbar */}
        <CustomersToolbar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          totalResults={filteredCustomers.length}
          selectedCount={selectedRows.size}
          onBulkBlacklist={handleBulkBlacklist}
          onExportAll={handleExportAll}
          onClearSelection={() => setSelectedRows(new Set())}
          bulkActionStatus={bulkActionStatus}
          bulkErrorMessage={bulkErrorMessage}
          onRetryBulk={() => executeBulkAction('blacklist')}
          exportStatus={exportStatus}
          exportProgress={exportProgress}
          onToggleFilter={() => setFilterCollapsed(!filterCollapsed)}
          activeFiltersCount={activePills.length}
          columns={columns}
          onColumnsChange={setColumns}
          activePills={activePills}
          onClearFilters={() => handleFiltersChange(INITIAL_FILTERS)}
        />

        {/* Layout containing Filter Sidebar, spreadsheet table and slide-over panel */}
        <div className="flex gap-4 flex-1 min-h-0 mt-3 relative">
          <CustomersFilterRail
            filters={filters}
            onFiltersChange={handleFiltersChange}
            customers={allCustomers}
            collapsed={filterCollapsed}
            onToggleCollapse={() => setFilterCollapsed(!filterCollapsed)}
          />

          <div className="flex-1 min-w-0 h-full flex flex-col">
            <CustomersTable
              customers={filteredCustomers}
              selectedRows={selectedRows}
              onSelectionChange={setSelectedRows}
              onRowClick={handleRowClick}
              activeCustomerId={activeCustomerId}
              pageSize={pageSize}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              onRowAction={handleRowAction}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              columns={columns}
              onColumnsChange={setColumns}
            />
          </div>

          {/* iOS Spring Slide-over Preview Panel */}
          <AnimatePresence>
            {activeCustomerId && (
              <CustomersPreviewPanel
                customer={activeCustomer}
                onClose={() => setActiveCustomerId(null)}
                onOpenWizard={handleOpenWizard}
                onStatusChange={handleStatusChange}
                onDeleteCustomer={handleDeleteCustomer}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
