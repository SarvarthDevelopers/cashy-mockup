import { useState, useMemo } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  ArrowDownRight, 
  ArrowUpRight, 
  Check, 
  X, 
  Download, 
  DollarSign,
  Trash2
} from 'lucide-react';
import { Button } from '../components/Button/Button';
import { Dropdown } from '../components/Dropdown/Dropdown';
import { Input } from '../components/Input/Input';
import { TextArea } from '../components/TextArea/TextArea';
import { FileUpload } from '../components/FileUpload/FileUpload';
import { Tooltip } from '../components/Tooltip/Tooltip';
import { ConfirmationModal } from '../components/Modal/ConfirmationModal';
import { DateRangePicker } from '../components/DatePicker/DateRangePicker';

// Types
interface LedgerEntry {
  id: string;
  date: string;
  customerId: string;
  paymentReference: string;
  note: string;
  inflow: number;
  outflow: number;
  feesAndInterest: number;
  balance: number;
  isManual?: boolean;
  shop?: string;
  type?: string;
}

interface DenominationConfig {
  value: number;
  label: string;
  registerCount: number;
  reserveCount: number;
}

// Mock Data
const mockLedgerEntries: LedgerEntry[] = [
  { id: '163867', date: '2026-05-21', customerId: '2030397', paymentReference: 'Payback', note: '', inflow: 425.00, outflow: 0, feesAndInterest: 25.00, balance: 103655.13, shop: 'vienna', type: 'BANK' },
  { id: '163866', date: '2026-05-20', customerId: '2030397', paymentReference: 'Payout', note: '', inflow: 0, outflow: 400.00, feesAndInterest: 0, balance: 103229.13, shop: 'vienna', type: 'BANK' },
  { id: '162042', date: '2026-04-23', customerId: '2031878', paymentReference: 'Extension Payout', note: '', inflow: 0, outflow: 2000.00, feesAndInterest: 0, balance: 103629.13, shop: 'vienna', type: 'CARD' },
  { id: '159963', date: '2026-04-23', customerId: '2031878', paymentReference: 'Extension Payback', note: '', inflow: 2097.00, outflow: 0, feesAndInterest: 97.00, balance: 105629.13, shop: 'vienna', type: 'BANK' },
  { id: '162015', date: '2026-04-22', customerId: '2018376', paymentReference: 'Payout', note: '', inflow: 0, outflow: 400.00, feesAndInterest: 0, balance: 103532.13, shop: 'graz', type: 'BANK' },
  { id: '161408', date: '2026-04-13', customerId: '', paymentReference: 'Miscellaneous', note: 'Verlängerung - Kundin Wien', inflow: 43.15, outflow: 0, feesAndInterest: 0, balance: 103932.13, isManual: true, shop: 'vienna', type: 'BANK' },
  { id: '158294', date: '2026-04-13', customerId: '2030397', paymentReference: 'Payback', note: '', inflow: 442.00, outflow: 0, feesAndInterest: 42.00, balance: 103888.98, shop: 'berlin', type: 'BANK' }
];

const mockDenominations: DenominationConfig[] = [
  { value: 500, label: '500 €', registerCount: 0, reserveCount: 0 },
  { value: 200, label: '200 €', registerCount: 47, reserveCount: 0 },
  { value: 100, label: '100 €', registerCount: 52, reserveCount: 0 },
  { value: 50, label: '50 €', registerCount: 102, reserveCount: 100 },
  { value: 20, label: '20 €', registerCount: 0, reserveCount: 0 },
  { value: 10, label: '10 €', registerCount: 175, reserveCount: 0 },
  { value: 5, label: '5 €', registerCount: 0, reserveCount: 0 },
  { value: 2, label: '2 €', registerCount: 0, reserveCount: 125 },
  { value: 1, label: '1 €', registerCount: 3, reserveCount: 125 },
  { value: 0.50, label: '50 Cent', registerCount: 0, reserveCount: 0 },
  { value: 0.20, label: '20 Cent', registerCount: 0, reserveCount: 0 },
  { value: 0.10, label: '10 Cent', registerCount: 8, reserveCount: 80 },
  { value: 0.05, label: '5 Cent', registerCount: 11, reserveCount: 0 },
  { value: 0.02, label: '2 Cent', registerCount: 1, reserveCount: 0 },
  { value: 0.01, label: '1 Cent', registerCount: 6, reserveCount: 201 }
];

const SHOP_OPTIONS = [
  { label: 'AT / Vienna HQ', value: 'vienna' },
  { label: 'AT / Graz Branch', value: 'graz' },
  { label: 'DE / Berlin Office', value: 'berlin' },
];

const TYPE_OPTIONS = [
  { label: 'BANK', value: 'BANK' },
  { label: 'CARD', value: 'CARD' },
  { label: 'CASH', value: 'CASH' },
  { label: 'PAYPAL', value: 'PAYPAL' },
  { label: 'UNZER', value: 'UNZER' },
];

const MANUAL_REFERENCE_OPTIONS = [
  { label: 'Bank withdrawal', value: 'Bank withdrawal' },
  { label: 'Marketing credit note', value: 'Marketing credit note' },
  { label: 'Miscellaneous booking', value: 'Miscellaneous booking' },
  { label: 'Bill', value: 'Bill' },
  { label: 'TIPICO', value: 'TIPICO' },
  { label: 'Other revenue', value: 'Other revenue' },
];

const parseDateString = (str: string): Date | null => {
  if (!str) return null;
  const [year, month, day] = str.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatDateString = (date: Date | null): string => {
  if (!date) return '';
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export function CashbookDashboard() {
  const [selectedShop, setSelectedShop] = useState('vienna');
  const [selectedType, setSelectedType] = useState('BANK');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const rangeValue = useMemo(() => ({
    from: parseDateString(startDate),
    to: parseDateString(endDate)
  }), [startDate, endDate]);

  const handleRangeChange = (range: { from: Date | null; to: Date | null }) => {
    setStartDate(formatDateString(range.from));
    setEndDate(formatDateString(range.to));
  };
  const [activeTab, setActiveTab] = useState('ledger');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Ledger and Denominations States
  const [ledgerData, setLedgerData] = useState<LedgerEntry[]>(mockLedgerEntries);
  const [denominations, setDenominations] = useState<DenominationConfig[]>(mockDenominations);

  // Hardcoded Expected Total
  const expectedTotal = 26839.44;

  // New Entry Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [entryType, setEntryType] = useState<'inflow' | 'outflow'>('inflow');
  const [entryReference, setEntryReference] = useState('');
  const [entryCustomerId, setEntryCustomerId] = useState('');
  const [entryFeesAndInterest, setEntryFeesAndInterest] = useState('');
  const [entryAmount, setEntryAmount] = useState('');
  const [entryNote, setEntryNote] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);

  // Dynamic Ledger calculations
  const filteredLedger = useMemo(() => {
    return ledgerData.filter(entry => {
      // Filter by Shop
      if (selectedShop && entry.shop !== selectedShop) return false;

      // Filter by Type
      if (selectedType && entry.type !== selectedType) return false;

      // Filter by Date Range
      if (startDate && entry.date < startDate) return false;
      if (endDate && entry.date > endDate) return false;

      // Search Query
      const searchStr = `${entry.id} ${entry.customerId} ${entry.paymentReference} ${entry.note}`.toLowerCase();
      return searchStr.includes(searchQuery.toLowerCase());
    });
  }, [ledgerData, selectedShop, selectedType, startDate, endDate, searchQuery]);

  const ledgerSummary = useMemo(() => {
    let totalInflow = 0;
    let totalOutflow = 0;
    filteredLedger.forEach(e => {
      totalInflow += e.inflow;
      totalOutflow += e.outflow;
    });
    return {
      totalInflow,
      totalOutflow,
      currentBalance: filteredLedger[0]?.balance || 0
    };
  }, [filteredLedger]);

  // Reconciliation calculations
  const registerTotal = useMemo(() => {
    return denominations.reduce((sum, d) => sum + (d.registerCount * d.value), 0);
  }, [denominations]);

  const reserveTotal = useMemo(() => {
    return denominations.reduce((sum, d) => sum + (d.reserveCount * d.value), 0);
  }, [denominations]);

  const totalCounted = registerTotal + reserveTotal;
  const reconciliationDifference = totalCounted - expectedTotal;

  // Format currency value as Euros: e.g. "€ 425.00"
  const formatEuro = (amount: number) => {
    return `€ ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}`;
  };

  // Conditional Styling for reference tags
  const formatRefBadgeStyle = (ref: string, inflow: number, outflow: number) => {
    const refLower = ref.toLowerCase();
    if (refLower.includes('miscellaneous')) {
      return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
    if (inflow > 0) {
      return 'bg-green-50 text-green-700 border border-green-200';
    }
    if (outflow > 0) {
      return 'bg-red-50 text-red-700 border border-red-200';
    }
    return 'bg-gray-50 text-gray-700 border border-gray-200';
  };

  // Handlers
  const handleCountChange = (
    value: number,
    field: 'registerCount' | 'reserveCount',
    valStr: string
  ) => {
    const val = valStr === '' ? 0 : parseInt(valStr, 10);
    if (isNaN(val) || val < 0) return;

    setDenominations(prev => 
      prev.map(d => d.value === value ? { ...d, [field]: val } : d)
    );
  };

  const handleDeleteEntry = (id: string) => {
    setLedgerData(prev => prev.filter(e => e.id !== id));
  };

  const handleNewEntrySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!entryReference) {
      errors.reference = 'Please select a payment reference';
    }
    if (!entryAmount || parseFloat(entryAmount) <= 0) {
      errors.amount = 'Please enter a valid amount greater than 0';
    }

    // Customer ID Validation (Required except for Miscellaneous booking)
    if (entryReference !== 'Miscellaneous booking') {
      if (!entryCustomerId) {
        errors.customerId = 'Please enter a Customer ID';
      } else if (!/^\d{7}$/.test(entryCustomerId)) {
        errors.customerId = 'Customer ID must be a 7-digit number';
      }
    } else {
      if (entryCustomerId && !/^\d{7}$/.test(entryCustomerId)) {
        errors.customerId = 'Customer ID must be a 7-digit number';
      }
    }

    // Fees + Interest Validation
    if (entryType === 'inflow' && entryFeesAndInterest) {
      const feesVal = parseFloat(entryFeesAndInterest);
      if (isNaN(feesVal) || feesVal < 0) {
        errors.fees = 'Please enter a valid positive fees amount';
      } else if (entryAmount && feesVal > parseFloat(entryAmount)) {
        errors.fees = 'Fees + Interest cannot exceed inflow amount';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Success - add entry
    const numericAmount = parseFloat(entryAmount);
    const prevBalance = ledgerData[0]?.balance || 0;
    const isFlowIn = entryType === 'inflow';
    const newBalance = isFlowIn ? prevBalance + numericAmount : prevBalance - numericAmount;

    // Log files to prevent TS6133 unused error
    if (uploadedFiles.length > 0) {
      console.log('Saving entry with uploaded receipt files:', uploadedFiles.map(f => f.name));
    }

    const newEntry: LedgerEntry = {
      id: `${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString().substring(0, 10),
      customerId: entryCustomerId,
      paymentReference: entryReference,
      note: entryNote,
      inflow: isFlowIn ? numericAmount : 0,
      outflow: !isFlowIn ? numericAmount : 0,
      feesAndInterest: isFlowIn ? (parseFloat(entryFeesAndInterest) || 0) : 0,
      balance: newBalance,
      isManual: true,
      shop: selectedShop,
      type: selectedType
    };

    setLedgerData(prev => [newEntry, ...prev]);
    setIsDrawerOpen(false);

    // Reset drawer state
    setEntryType('inflow');
    setEntryReference('');
    setEntryCustomerId('');
    setEntryFeesAndInterest('');
    setEntryAmount('');
    setEntryNote('');
    setUploadedFiles([]);
    setFormErrors({});
  };

  // Export ledger to CSV
  const handleExportLedger = () => {
    const headers = [
      'Cashbook #', 'Booking ID', 'Date', 'Customer ID',
      'Payment Reference', 'Note', 'Inflow', 'Fees + Interest',
      'Outflow', 'Balance'
    ];

    const rows = filteredLedger.map((entry, index) => [
      String(filteredLedger.length - index).padStart(2, '0'),
      entry.id,
      entry.date,
      entry.customerId || '',
      entry.paymentReference,
      entry.note || '',
      entry.inflow || 0,
      entry.feesAndInterest || 0,
      entry.outflow || 0,
      entry.balance
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cashbook-ledger-${selectedShop}-${selectedType}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[var(--background-tertiary)] h-full w-full flex flex-col font-sans overflow-hidden select-none">
      
      {/* Header section */}
      <div className="bg-[var(--background-primary)] border-b border-[var(--border-subtle)] flex flex-col md:flex-row md:items-center justify-between px-6 py-4 gap-4 shrink-0">
        <div className="flex flex-wrap items-center gap-6">
          <h1 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Cashbook</h1>
          
          <div className="w-[1.5px] h-6 bg-[var(--border-subtle)] hidden md:block" />

          {/* Shop Selector Dropdown */}
          <div className="flex flex-col gap-1 w-48">
            <span className="text-[10px] font-black text-[var(--text-subtlest)] uppercase tracking-wider pl-1">Shop</span>
            <Dropdown
              options={SHOP_OPTIONS}
              value={selectedShop}
              onChange={setSelectedShop}
            />
          </div>

          {/* Cashbook Type Dropdown */}
          <div className="flex flex-col gap-1 w-40">
            <span className="text-[10px] font-black text-[var(--text-subtlest)] uppercase tracking-wider pl-1">Type</span>
            <Dropdown
              options={TYPE_OPTIONS}
              value={selectedType}
              onChange={setSelectedType}
            />
          </div>

          {/* Date Range Picker */}
          <div className="flex flex-col gap-1 w-64">
            <span className="text-[10px] font-black text-[var(--text-subtlest)] uppercase tracking-wider pl-1">Date Range</span>
            <DateRangePicker
              value={rangeValue}
              onChange={handleRangeChange}
              placeholder="Select date range"
              className="w-full"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <Button 
            onClick={handleExportLedger} 
            variant="secondary" 
            className="font-extrabold flex items-center gap-1.5 h-10 px-4 text-xs shrink-0"
          >
            <Download size={14} />
            <span>Export</span>
          </Button>

          <Button 
            onClick={() => setIsDrawerOpen(true)} 
            variant="primary" 
            className="font-extrabold flex items-center gap-1.5 h-10 px-4 text-xs shrink-0"
          >
            <Plus size={16} />
            <span>New Entry</span>
          </Button>
        </div>
      </div>

      {/* Tabs navigation block */}
      <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-[var(--background-primary)] border-b border-[var(--border-subtle)] px-6 shrink-0 flex items-center justify-between">
          <Tabs.List className="flex gap-6">
            <Tabs.Trigger
              value="ledger"
              className="py-3 text-[13px] font-extrabold uppercase tracking-wider text-[var(--text-subtlest)] border-b-2 border-transparent transition-all cursor-pointer focus:outline-none data-[state=active]:border-[var(--border-brand)] data-[state=active]:text-[var(--text-brand)] hover:text-[var(--text-primary)]"
            >
              Ledger
            </Tabs.Trigger>
            <Tabs.Trigger
              value="reconciliation"
              className="py-3 text-[13px] font-extrabold uppercase tracking-wider text-[var(--text-subtlest)] border-b-2 border-transparent transition-all cursor-pointer focus:outline-none data-[state=active]:border-[var(--border-brand)] data-[state=active]:text-[var(--text-brand)] hover:text-[var(--text-primary)]"
            >
              Reconciliation
            </Tabs.Trigger>
          </Tabs.List>

          {/* Quick summary view */}
          {activeTab === 'ledger' && (
            <div className="hidden sm:flex items-center gap-6 py-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[var(--text-subtlest)] font-semibold">Total Inflow:</span>
                <span className="text-[var(--text-success)] font-black">{formatEuro(ledgerSummary.totalInflow)}</span>
              </div>
              <div className="w-[1.5px] h-3 bg-[var(--border-subtle)]" />
              <div className="flex items-center gap-2">
                <span className="text-[var(--text-subtlest)] font-semibold">Total Outflow:</span>
                <span className="text-[var(--text-error)] font-black">{formatEuro(ledgerSummary.totalOutflow)}</span>
              </div>
              <div className="w-[1.5px] h-3 bg-[var(--border-subtle)]" />
              <div className="flex items-center gap-2">
                <span className="text-[var(--text-subtlest)] font-semibold">Current Balance:</span>
                <span className="text-[var(--text-primary)] font-black">{formatEuro(ledgerSummary.currentBalance)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Tab contents */}
        <div className="flex-1 min-h-0 relative">
          
          {/* LEDGER TAB */}
          <Tabs.Content value="ledger" className="absolute inset-0 flex flex-col p-6 min-h-0">
            {/* Filter and Search rail */}
            <div className="bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 flex items-center justify-between gap-4 mb-4 shrink-0 shadow-sm">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtlest)]" size={16} />
                <input
                  type="text"
                  placeholder="Search transactions by reference, ID, customer..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[var(--background-secondary)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-brand)] font-semibold"
                />
              </div>
            </div>

            {/* Ledger Table Spreadsheet */}
            <div className="flex-1 bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-xl flex flex-col overflow-hidden shadow-sm">
              <div className="flex-1 overflow-auto slick-scrollbar bg-[var(--background-primary)]">
                <table className="w-full border-collapse text-left text-sm select-text bg-[var(--background-primary)]">
                  <thead>
                    <tr className="bg-[var(--background-secondary)] border-b border-[var(--border-subtle)] select-none">
                      <th className="px-2.5 py-3.5 text-[10px] font-black uppercase text-[var(--text-subtlest)] tracking-wider w-16">
                        <Tooltip content="Cashbook Number">
                          <span className="cursor-help underline decoration-dotted decoration-[var(--text-subtlest)] whitespace-nowrap">Cashbook #</span>
                        </Tooltip>
                      </th>
                      <th className="px-2.5 py-3.5 text-[10px] font-black uppercase text-[var(--text-subtlest)] tracking-wider">
                        <Tooltip content="Booking ID">
                          <span className="cursor-help underline decoration-dotted decoration-[var(--text-subtlest)] whitespace-nowrap">Booking</span>
                        </Tooltip>
                      </th>
                      <th className="px-2.5 py-3.5 text-[10px] font-black uppercase text-[var(--text-subtlest)] tracking-wider">Date</th>
                      <th className="px-2.5 py-3.5 text-[10px] font-black uppercase text-[var(--text-subtlest)] tracking-wider">Customer ID</th>
                      <th className="px-2.5 py-3.5 text-[10px] font-black uppercase text-[var(--text-subtlest)] tracking-wider">Payment Reference</th>
                      <th className="px-2.5 py-3.5 text-[10px] font-black uppercase text-[var(--text-subtlest)] tracking-wider">Note</th>
                      
                      {/* INFLOW HEADER WITH SVG ICON & TOOLTIP */}
                      <th className="px-2.5 py-3.5 text-[10px] font-black uppercase text-[var(--text-subtlest)] tracking-wider text-right">
                        <Tooltip content="Inflow Amount">
                          <div className="flex items-center justify-end gap-1.5 cursor-help">
                            <svg className="w-4 h-4 text-[var(--text-success)]" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                            </svg>
                            <span>Inflow</span>
                          </div>
                        </Tooltip>
                      </th>

                      {/* FEES + INTEREST HEADER WITH SVG ICON & TOOLTIP */}
                      <th className="px-2.5 py-3.5 text-[10px] font-black uppercase text-[var(--text-subtlest)] tracking-wider text-right">
                        <Tooltip content="Fees + Interest">
                          <div className="flex items-center justify-end gap-1.5 cursor-help">
                            <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
                              <path d="M21 12a9 9 0 1 1-6.21-8.56"/>
                            </svg>
                            <span>Fees + Int</span>
                          </div>
                        </Tooltip>
                      </th>

                      {/* OUTFLOW HEADER WITH SVG ICON & TOOLTIP */}
                      <th className="px-2.5 py-3.5 text-[10px] font-black uppercase text-[var(--text-subtlest)] tracking-wider text-right">
                        <Tooltip content="Outflow Amount">
                          <div className="flex items-center justify-end gap-1.5 cursor-help">
                            <svg className="w-4 h-4 text-[var(--text-error)]" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                              <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z"/>
                            </svg>
                            <span>Outflow</span>
                          </div>
                        </Tooltip>
                      </th>
                      <th className="px-2.5 py-3.5 text-[10px] font-black uppercase text-[var(--text-subtlest)] tracking-wider text-right">Balance</th>
                      <th className="px-2.5 py-3.5 text-[10px] font-black uppercase text-[var(--text-subtlest)] tracking-wider text-center w-16">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {filteredLedger.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="px-2.5 py-12 text-center text-[var(--text-subtlest)] font-semibold">
                          No transactions match your search query.
                        </td>
                      </tr>
                    ) : (
                      filteredLedger.map((entry) => (
                        <tr key={entry.id} className="hover:bg-[var(--background-secondary)]/40 transition-colors border-b border-[var(--border-subtle)]">
                          <td className="px-2.5 py-5 font-mono font-semibold text-[12px] text-[var(--text-subtlest)] select-none">
                            {String(ledgerData.length - ledgerData.indexOf(entry)).padStart(2, '0')}
                          </td>
                          <td className="px-2.5 py-5 font-semibold text-[13px] text-[var(--text-primary)]">{entry.id}</td>
                          <td className="px-2.5 py-5 text-[12px] font-medium text-[var(--text-subtlest)]">
                            {new Date(entry.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </td>
                          <td className="px-2.5 py-5 font-semibold text-[13px] text-[var(--text-primary)]">
                            {entry.customerId || '—'}
                          </td>
                          <td className="px-2.5 py-5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${formatRefBadgeStyle(entry.paymentReference, entry.inflow, entry.outflow)}`}>
                              {entry.paymentReference}
                            </span>
                          </td>
                          <td className="px-2.5 py-5 text-[13px] font-medium text-[var(--text-subtle)] max-w-xs truncate" title={entry.note}>
                            {entry.note || '—'}
                          </td>
                          <td className="px-2.5 py-5 text-right font-semibold text-[13px] tabular-nums text-[var(--text-success)]">
                            {entry.inflow > 0 ? `+ ${formatEuro(entry.inflow)}` : '—'}
                          </td>
                          <td className="px-2.5 py-5 text-right font-semibold text-[13px] tabular-nums text-blue-600">
                            {entry.feesAndInterest > 0 ? formatEuro(entry.feesAndInterest) : '—'}
                          </td>
                          <td className="px-2.5 py-5 text-right font-semibold text-[13px] tabular-nums text-[var(--text-error)]">
                            {entry.outflow > 0 ? `- ${formatEuro(entry.outflow)}` : '—'}
                          </td>
                          <td className="px-2.5 py-5 text-right font-semibold text-[13px] tabular-nums text-[var(--text-primary)]">
                            {formatEuro(entry.balance)}
                          </td>
                          <td className="px-2.5 py-5 text-center">
                            {entry.isManual ? (
                              <button
                                onClick={() => setDeleteEntryId(entry.id)}
                                className="p-1 text-gray-400 hover:text-[#EF4444] hover:bg-[#FEF2F2] rounded transition-all cursor-pointer border border-transparent hover:border-[#FECACA] bg-transparent"
                                title="Delete Manual Entry"
                              >
                                <Trash2 size={15} />
                              </button>
                            ) : (
                              <span className="text-[10px] text-gray-300 font-extrabold uppercase select-none">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Tabs.Content>

          {/* RECONCILIATION TAB */}
          <Tabs.Content value="reconciliation" className="absolute inset-0 flex flex-col p-6 min-h-0 overflow-y-auto slick-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-24">
              
              {/* REGISTER COUNTING */}
              <div className="bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4 border-b border-[var(--border-subtle)] pb-3">
                  <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider">Register Counting</h3>
                  <span className="text-sm font-black text-[var(--text-primary)] bg-[var(--background-secondary)] px-3 py-1 rounded-lg">
                    Total: {formatEuro(registerTotal)}
                  </span>
                </div>
                <div className="flex flex-col gap-2.5">
                  {denominations.map(denom => (
                    <div key={`reg-${denom.value}`} className="flex items-center justify-between gap-4 py-1.5 border-b border-[var(--border-subtlest)] last:border-0">
                      <span className="text-xs font-black text-[var(--text-subtle)] w-20">{denom.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-gray-400 font-extrabold uppercase">Qty</span>
                        <input
                          type="number"
                          value={denom.registerCount === 0 ? '' : denom.registerCount}
                          onChange={e => handleCountChange(denom.value, 'registerCount', e.target.value)}
                          placeholder="0"
                          className="w-20 px-2 py-1 bg-[var(--background-secondary)] border border-[var(--border-subtle)] rounded text-right text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-brand)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                      <span className="text-xs font-black text-[var(--text-primary)] text-right w-24">
                        {formatEuro(denom.registerCount * denom.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* RESERVE COUNTING */}
              <div className="bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4 border-b border-[var(--border-subtle)] pb-3">
                  <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider">Reserve Counting</h3>
                  <span className="text-sm font-black text-[var(--text-primary)] bg-[var(--background-secondary)] px-3 py-1 rounded-lg">
                    Total: {formatEuro(reserveTotal)}
                  </span>
                </div>
                <div className="flex flex-col gap-2.5">
                  {denominations.map(denom => (
                    <div key={`res-${denom.value}`} className="flex items-center justify-between gap-4 py-1.5 border-b border-[var(--border-subtlest)] last:border-0">
                      <span className="text-xs font-black text-[var(--text-subtle)] w-20">{denom.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-gray-400 font-extrabold uppercase">Qty</span>
                        <input
                          type="number"
                          value={denom.reserveCount === 0 ? '' : denom.reserveCount}
                          onChange={e => handleCountChange(denom.value, 'reserveCount', e.target.value)}
                          placeholder="0"
                          className="w-20 px-2 py-1 bg-[var(--background-secondary)] border border-[var(--border-subtle)] rounded text-right text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-brand)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                      <span className="text-xs font-black text-[var(--text-primary)] text-right w-24">
                        {formatEuro(denom.reserveCount * denom.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Sticky/Fixed Bottom Calculations Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-[var(--background-primary)] border-t border-[var(--border-subtle)] py-4 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_-8px_32px_rgba(19,21,24,0.05)] z-10 select-none">
              <div className="flex flex-wrap items-center gap-6 md:gap-12">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-black text-[var(--text-subtlest)] uppercase tracking-wider">Total Counted</span>
                  <span className="text-base font-black text-[var(--text-primary)]">{formatEuro(totalCounted)}</span>
                </div>
                <div className="w-[1.5px] h-6 bg-[var(--border-subtle)] hidden md:block" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-black text-[var(--text-subtlest)] uppercase tracking-wider">Expected Total</span>
                  <span className="text-base font-black text-[var(--text-subtle)]">{formatEuro(expectedTotal)}</span>
                </div>
                <div className="w-[1.5px] h-6 bg-[var(--border-subtle)] hidden md:block" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-black text-[var(--text-subtlest)] uppercase tracking-wider">Variance / Difference</span>
                  {Math.abs(reconciliationDifference) < 0.001 ? (
                    <span className="text-base font-black text-[var(--text-success)]">
                      {formatEuro(0.00)}
                    </span>
                  ) : (
                    <span className="text-base font-black text-[#EF4444] bg-[#FEF2F2] border border-[#FECACA] px-2 py-0.5 rounded animate-pulse">
                      {reconciliationDifference > 0 ? '+' : ''}{formatEuro(reconciliationDifference)} (Discrepancy)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="secondary" onClick={() => {
                  setDenominations(prev => prev.map(d => ({ ...d, registerCount: 0, reserveCount: 0 })));
                }} className="h-10 text-xs font-extrabold">Reset Counts</Button>
                
                <Button 
                  variant="primary" 
                  disabled={Math.abs(reconciliationDifference) >= 0.001} 
                  className="h-10 text-xs font-black"
                >
                  <Check size={14} className="mr-1.5" />
                  <span>Submit Reconciliation</span>
                </Button>
              </div>
            </div>
          </Tabs.Content>

        </div>
      </Tabs.Root>

      {/* NEW ENTRY DRAWER */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 z-[200] bg-[#131518]"
            />
            {/* Slide-out Sheet */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed inset-y-0 right-0 z-[201] w-full max-w-md bg-[var(--background-primary)] border-l border-[var(--border-subtle)] flex flex-col shadow-2xl overflow-hidden"
              role="dialog"
              aria-label="New Cashbook Entry Form"
            >
              {/* Drawer Header */}
              <div className="px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--background-secondary)] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--border-brand)]" />
                  <h2 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider">New Ledger Entry</h2>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 hover:bg-[var(--background-primary)] border border-transparent hover:border-[var(--border-subtle)] rounded-lg transition-colors cursor-pointer"
                  aria-label="Close form drawer"
                >
                  <X size={16} className="text-[var(--text-subtlest)] hover:text-[var(--text-primary)]" />
                </button>
              </div>

              {/* Form Scroll Container */}
              <form onSubmit={handleNewEntrySubmit} className="flex-1 overflow-y-auto slick-scrollbar p-5 flex flex-col gap-5">
                
                {/* Type Selection tab-like buttons */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-[#131518] uppercase tracking-wider">Entry Flow Type</span>
                  <div className="grid grid-cols-2 gap-2 bg-[var(--background-secondary)] p-1 rounded-xl border border-[var(--border-subtle)]">
                    <button
                      type="button"
                      onClick={() => setEntryType('inflow')}
                      className={`flex items-center justify-center gap-1.5 py-2 text-xs font-extrabold rounded-lg border-none transition-all cursor-pointer ${
                        entryType === 'inflow' 
                          ? 'bg-[var(--background-primary)] text-[var(--text-success)] shadow-sm' 
                          : 'text-[var(--text-subtlest)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <ArrowDownRight size={14} />
                      <span>Inflow (+)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEntryType('outflow')}
                      className={`flex items-center justify-center gap-1.5 py-2 text-xs font-extrabold rounded-lg border-none transition-all cursor-pointer ${
                        entryType === 'outflow' 
                          ? 'bg-[var(--background-primary)] text-[var(--text-error)] shadow-sm' 
                          : 'text-[var(--text-subtlest)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <ArrowUpRight size={14} />
                      <span>Outflow (-)</span>
                    </button>
                  </div>
                </div>

                {/* Customer ID input instead of Storage label dropdown */}
                <Input
                  type="text"
                  label="Customer ID"
                  placeholder="e.g. 2030397"
                  value={entryCustomerId}
                  onChange={e => {
                    setEntryCustomerId(e.target.value);
                    setFormErrors(prev => ({ ...prev, customerId: '' }));
                  }}
                  error={!!formErrors.customerId}
                  errorMessage={formErrors.customerId}
                  required={entryReference !== 'Miscellaneous booking'}
                />

                {/* Payment Reference */}
                <Dropdown
                  options={MANUAL_REFERENCE_OPTIONS}
                  value={entryReference}
                  onChange={(val) => {
                    setEntryReference(val);
                    setFormErrors(prev => ({ ...prev, reference: '' }));
                  }}
                  label="Payment Reference"
                  placeholder="Select Reference Type"
                  error={!!formErrors.reference}
                  errorMessage={formErrors.reference}
                  required
                />

                {/* Amount input */}
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  label="Transaction Amount (€)"
                  placeholder="0.00"
                  value={entryAmount}
                  onChange={e => {
                    setEntryAmount(e.target.value);
                    setFormErrors(prev => ({ ...prev, amount: '' }));
                  }}
                  error={!!formErrors.amount}
                  errorMessage={formErrors.amount}
                  required
                  leftIcon={<DollarSign size={14} className="text-gray-400" />}
                />

                {/* Fees + Interest input (Visible only for inflows) */}
                {entryType === 'inflow' && (
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    label="Fees + Interest (€)"
                    placeholder="0.00"
                    value={entryFeesAndInterest}
                    onChange={e => {
                      setEntryFeesAndInterest(e.target.value);
                      setFormErrors(prev => ({ ...prev, fees: '' }));
                    }}
                    error={!!formErrors.fees}
                    errorMessage={formErrors.fees}
                    leftIcon={<DollarSign size={14} className="text-gray-400" />}
                  />
                )}

                {/* Note */}
                <TextArea
                  label="Transaction Note / Details"
                  placeholder="Enter details about this entry..."
                  value={entryNote}
                  onChange={e => setEntryNote(e.target.value)}
                  rows={3}
                />

                {/* File upload zone */}
                <FileUpload
                  label="Supporting Documents / Receipts"
                  description="Upload PDFs, receipts, or screenshots up to 10MB"
                  accept=".pdf,.png,.jpg,.jpeg"
                  multiple={true}
                  onUpload={(files) => setUploadedFiles(prev => [...prev, ...files])}
                />

              </form>

              {/* Form Actions Footer */}
              <div className="px-5 py-4 border-t border-[var(--border-subtle)] bg-[var(--background-secondary)] shrink-0 flex items-center justify-end gap-3">
                <Button variant="secondary" onClick={() => setIsDrawerOpen(false)} className="h-10 text-xs font-extrabold">
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleNewEntrySubmit} className="h-10 text-xs font-black">
                  Create Ledger Entry
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={deleteEntryId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteEntryId(null);
        }}
        title="Delete Ledger Entry"
        description="Are you sure you want to delete this manual ledger entry? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => {
          if (deleteEntryId) {
            handleDeleteEntry(deleteEntryId);
            setDeleteEntryId(null);
          }
        }}
      />

    </div>
  );
}
