import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Dropdown, Toggle } from '../';
import type { DealData } from '../../data/mockData';

// Re-importing Lucide icons explicitly to avoid index mismatches
import { 
  X as XIcon, 
  Calendar as CalendarIcon,
  Trash2 as TrashIcon,
  Plus as PlusIcon,
  AlertTriangle as AlertTriangleIcon,
  ArrowUpRight as ArrowUpRightIcon
} from 'lucide-react';

export interface FeeComponent {
    id: string;
    level: 'deal' | 'item';
    itemId?: string;
    type: string;
    customName?: string;
    amount: number;
    taxRate: number;
    isDefault?: boolean;
}

const DEAL_FEE_TYPES = [
    'Interest',
    'Staggered fee',
    'Transport fee (Pickup)',
    'Transport fee (Drop-off)',
    'Discount',
    'No Interest & Fees (1 month)',
    'Withdrawal fee',
    'Other'
];

const ITEM_FEE_TYPES = [
    'Manipulation Fee',
    'Storage Fee',
    'Cleaning Fee',
    'Verification',
    'Liquidation Fee',
    'Third Party Costs',
    'Cash Expenditures',
    'Other'
];

export interface ExtendDealModalProps {
    isOpen: boolean;
    onClose: () => void;
    dealData?: DealData;
    onUpdateDeal?: (deal: DealData) => void;
}



// Helper: format euro
function fmtEur(n: number) {
    return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Helper: format date
function fmtDate(d: Date) {
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Parse amounts like "€9,800" or "€1.200,00"
function parseEurAmount(str: string): number {
    if (!str) return 0;
    let cleaned = str.replace(/[€\s]/g, '');
    if (cleaned.includes('.') && cleaned.includes(',')) {
        if (cleaned.indexOf('.') < cleaned.indexOf(',')) {
            cleaned = cleaned.replace(/\./g, '').replace(',', '.');
        } else {
            cleaned = cleaned.replace(/,/g, '');
        }
    } else if (cleaned.includes(',')) {
        const parts = cleaned.split(',');
        if (parts.length === 2 && parts[1].length === 3) {
            cleaned = cleaned.replace(/,/g, '');
        } else {
            cleaned = cleaned.replace(/,/g, '.');
        }
    } else if (cleaned.includes('.')) {
        const parts = cleaned.split('.');
        if (parts.length === 2 && parts[1].length === 3) {
            cleaned = cleaned.replace(/\./g, '');
        } else if (parts.length > 2) {
            cleaned = cleaned.replace(/\./g, '');
        }
    }
    return parseFloat(cleaned) || 0;
}

// Parse due date strings like "Jan 20" into a Date
function parseDueDate(str?: string): Date {
    if (!str || str === '—') return new Date();
    const months: Record<string, number> = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    };
    const [mon, day] = str.split(' ');
    if (months[mon] !== undefined && day) {
        const d = new Date();
        d.setMonth(months[mon]);
        d.setDate(parseInt(day, 10));
        // If the month already passed this year, move to next year
        if (d < new Date()) d.setFullYear(d.getFullYear() + 1);
        return d;
    }
    const parsed = Date.parse(str);
    return isNaN(parsed) ? new Date() : new Date(parsed);
}

export const ExtendDealModal: React.FC<ExtendDealModalProps> = ({
    isOpen,
    onClose,
    dealData,
    onUpdateDeal
}) => {
    // --- Calculations derived from props ---
    const currentPayout = dealData ? parseEurAmount(dealData.amount || '0') : 0;
    const currentDuration = dealData ? parseInt(dealData.wizardData?.dealDuration || '0', 10) : 0;
    const elapsedDays = currentDuration || 30;
    const calculatedBaseFees = Math.round(currentPayout * 0.04 * (elapsedDays / 30));

    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [extensionDays, setExtensionDays] = useState('30');
    
    // Step 3: Loan Adjustment states
    const [adjustmentMode, setAdjustmentMode] = useState<'none' | 'payback' | 'payout'>('none');
    const [adjustmentAmountInput, setAdjustmentAmountInput] = useState('');

    // Step 4: Overrides states & Fee Components
    const [feeComponents, setFeeComponents] = useState<FeeComponent[]>(() => {
        const components: FeeComponent[] = [
            { id: 'deal-1', level: 'deal', type: 'Interest', amount: calculatedBaseFees * 0.5, taxRate: 0, isDefault: true },
            { id: 'deal-2', level: 'deal', type: 'Staggered fee', amount: calculatedBaseFees * 0.3, taxRate: 20, isDefault: true }
        ];
        dealData?.items.forEach((item, idx) => {
            components.push({
                id: `item-storage-${idx}`,
                level: 'item',
                itemId: item,
                type: 'Storage Fee',
                amount: 1.00,
                taxRate: 20,
                isDefault: true
            });
        });
        return components;
    });

    const [isEditingDeal, setIsEditingDeal] = useState(false);
    const [selectModeIds, setSelectModeIds] = useState<Set<string>>(new Set());
    const [editingItemIds, setEditingItemIds] = useState<string[]>([]);
    const [feeOverrideReason, setFeeOverrideReason] = useState('');
    
    // Child Fee States
    const [carryForwardFees, setCarryForwardFees] = useState(true);
    const [childFeeComponents, setChildFeeComponents] = useState<FeeComponent[]>([]);
    const [isEditingChildDeal, setIsEditingChildDeal] = useState(false);
    const [editingChildItemIds, setEditingChildItemIds] = useState<string[]>([]);
    const [selectModeChildIds, setSelectModeChildIds] = useState<Set<string>>(new Set());

    const [allowOnlineExtension, setAllowOnlineExtension] = useState(true);

    // Step 5: Payment states
    const [paymentType, setPaymentType] = useState('Cash');
    const [cashBookName, setCashBookName] = useState(() => {
        return dealData?.countryCode === 'DE' ? 'Munich Main Cash' : 'Vienna Main Cash';
    });

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const isAutoScrollingRef = useRef(false);

    const scrollToSection = (targetStep: number) => {
        const container = scrollContainerRef.current;
        if (!container) return;
        
        const element = container.querySelector(`#extend-step-${targetStep}`);
        if (element) {
            isAutoScrollingRef.current = true;
            setStep(targetStep);
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => {
                isAutoScrollingRef.current = false;
            }, 800);
        }
    };

    const handleScroll = () => {
        if (isAutoScrollingRef.current) return;
        const container = scrollContainerRef.current;
        if (!container) return;
        
        const containerRect = container.getBoundingClientRect();
        const stepIds = [1, 2, 3, 4, 5];
        let active = step;
        
        for (const s of stepIds) {
            const el = container.querySelector(`#extend-step-${s}`);
            if (el) {
                const rect = el.getBoundingClientRect();
                if (rect.top - containerRect.top <= 120) {
                    active = s;
                }
            }
        }
        
        if (active !== step) {
            setStep(active);
        }
    };

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                setStep(1);
                setExtensionDays('30');
                setAdjustmentMode('none');
                setAdjustmentAmountInput('');
                
                // Initialize fee components
                const components: FeeComponent[] = [
                    { id: 'deal-1', level: 'deal', type: 'Interest', amount: calculatedBaseFees * 0.5, taxRate: 0, isDefault: true },
                    { id: 'deal-2', level: 'deal', type: 'Staggered fee', amount: calculatedBaseFees * 0.3, taxRate: 20, isDefault: true }
                ];
                dealData?.items.forEach((item, idx) => {
                    components.push({
                        id: `item-storage-${idx}`,
                        level: 'item',
                        itemId: item,
                        type: 'Storage Fee',
                        amount: 1.00,
                        taxRate: 20,
                        isDefault: true
                    });
                });
                setFeeComponents(components);

                setIsEditingDeal(false);
                setEditingItemIds([]);
                setFeeOverrideReason('');
                setCarryForwardFees(true);
                setChildFeeComponents(components);
                setIsEditingChildDeal(false);
                setEditingChildItemIds([]);
                setSelectModeChildIds(new Set());
                setAllowOnlineExtension(true);
                setPaymentType('Cash');
                setCashBookName(dealData?.countryCode === 'DE' ? 'Munich Main Cash' : 'Vienna Main Cash');
                if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTop = 0;
                }
                setIsSubmitting(false);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [isOpen, dealData?.id, dealData?.countryCode, calculatedBaseFees, dealData?.items]);

    // Fee modification handlers
    const handleAddDealFeeComponent = () => {
        const newComp: FeeComponent = {
            id: String(Math.floor(Math.random() * 1000000)),
            level: 'deal',
            type: 'Other',
            customName: 'Other Fee',
            amount: 0,
            taxRate: 20,
            isDefault: false
        };
        setFeeComponents([...feeComponents, newComp]);
    };

    const handleAddItemFeeComponent = (itemName: string) => {
        const newComp: FeeComponent = {
            id: String(Math.floor(Math.random() * 1000000)),
            level: 'item',
            itemId: itemName,
            type: 'Other',
            customName: 'Other Fee',
            amount: 0,
            taxRate: 20,
            isDefault: false
        };
        setFeeComponents([...feeComponents, newComp]);
    };

    const handleUpdateComponent = (id: string, updates: Partial<FeeComponent>) => {
        setFeeComponents(feeComponents.map(comp => {
            if (comp.id === id) {
                const updated = { ...comp, ...updates };
                if (updates.type) {
                    if (updates.type === 'Interest' || updates.type === 'Discount' || updates.type === 'No Interest & Fees (1 month)') {
                        updated.taxRate = 0;
                    } else {
                        updated.taxRate = 20;
                    }
                }
                return updated;
            }
            return comp;
        }));
    };

    const enterSelectMode = (id: string) => setSelectModeIds(prev => new Set([...prev, id]));
    const exitSelectMode = (id: string) => setSelectModeIds(prev => { const s = new Set(prev); s.delete(id); return s; });

    const handleDeleteComponent = (id: string) => {
        setFeeComponents(feeComponents.filter(comp => comp.id !== id));
    };

    // Keep child components in sync with parent when carry-forward is active
    useEffect(() => {
        if (carryForwardFees) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setChildFeeComponents(feeComponents);
        }
    }, [feeComponents, carryForwardFees]);

    // Child Fee modification handlers
    const handleAddChildDealFeeComponent = () => {
        const newComp: FeeComponent = {
            id: String(Math.floor(Math.random() * 1000000)),
            level: 'deal',
            type: 'Other',
            customName: 'Other Fee',
            amount: 0,
            taxRate: 20,
            isDefault: false
        };
        setChildFeeComponents([...childFeeComponents, newComp]);
    };

    const handleAddChildItemFeeComponent = (itemName: string) => {
        const newComp: FeeComponent = {
            id: String(Math.floor(Math.random() * 1000000)),
            level: 'item',
            itemId: itemName,
            type: 'Other',
            customName: 'Other Fee',
            amount: 0,
            taxRate: 20,
            isDefault: false
        };
        setChildFeeComponents([...childFeeComponents, newComp]);
    };

    const handleUpdateChildComponent = (id: string, updates: Partial<FeeComponent>) => {
        setChildFeeComponents(childFeeComponents.map(comp => {
            if (comp.id === id) {
                const updated = { ...comp, ...updates };
                if (updates.type) {
                    if (updates.type === 'Interest' || updates.type === 'Discount' || updates.type === 'No Interest & Fees (1 month)') {
                        updated.taxRate = 0;
                    } else {
                        updated.taxRate = 20;
                    }
                }
                return updated;
            }
            return comp;
        }));
    };

    const enterChildSelectMode = (id: string) => setSelectModeChildIds(prev => new Set([...prev, id]));
    const exitChildSelectMode = (id: string) => setSelectModeChildIds(prev => { const s = new Set(prev); s.delete(id); return s; });

    const handleDeleteChildComponent = (id: string) => {
        setChildFeeComponents(childFeeComponents.filter(comp => comp.id !== id));
    };

    if (!isOpen || !dealData) return null;

    // --- Calculations ---
    const mockMarketValue = currentPayout * 2.2;
    const maxAllowedPayout = mockMarketValue * 0.60;
    const additionalPossible = Math.max(0, maxAllowedPayout - currentPayout);

    const origDueDate = parseDueDate(dealData.dueDate);
    const newDueDate = new Date(origDueDate);
    newDueDate.setDate(newDueDate.getDate() + parseInt(extensionDays, 10));

    const adjustmentAmountNum = parseFloat(adjustmentAmountInput) || 0;
    const adjustmentAmount = adjustmentMode === 'payback' ? adjustmentAmountNum : adjustmentMode === 'payout' ? -adjustmentAmountNum : 0;
    const newTotalPayout = currentPayout - adjustmentAmount;

    const finalParentFees = feeComponents.reduce((sum, comp) => sum + (comp.amount || 0), 0);
    const defaultFeesBaseline = (calculatedBaseFees * 0.8) + (dealData.items.length * 1.00);
    const isFeesOverridden = Math.abs(finalParentFees - defaultFeesBaseline) > 0.01;
    const isNotesRequired = isFeesOverridden && !feeOverrideReason.trim();

    const TOTAL_STEPS = 5;

    const goNext = () => {
        scrollToSection(step + 1);
    };

    const goBack = () => {
        scrollToSection(step - 1);
    };

    const handleConfirm = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            if (onUpdateDeal) {
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const formattedDueDate = `${monthNames[newDueDate.getMonth()]} ${newDueDate.getDate()}`;

                const meta = JSON.stringify({
                    originalDueDate: dealData.dueDate || '—',
                    originalPayout: currentPayout,
                    extensionDays: parseInt(extensionDays, 10),
                    adjustmentAmount: adjustmentAmount,
                    overwrittenParentFees: finalParentFees,
                    feeBreakdown: feeComponents.map(c => ({
                        level: c.level,
                        itemId: c.itemId,
                        type: c.type,
                        name: c.type === 'Other' ? c.customName : c.type,
                        amount: c.amount,
                        taxRate: c.taxRate
                    })),
                    carryForwardFees: carryForwardFees,
                    childFeeBreakdown: carryForwardFees ? undefined : childFeeComponents.map(c => ({
                        level: c.level,
                        itemId: c.itemId,
                        type: c.type,
                        name: c.type === 'Other' ? c.customName : c.type,
                        amount: c.amount,
                        taxRate: c.taxRate
                    })),
                    allowOnlineExtension: allowOnlineExtension,
                    paymentType: paymentType,
                    cashBookName: ['Cash', 'Debit/Credit Card'].includes(paymentType) ? cashBookName : undefined,
                    newDueDate: formattedDueDate,
                    newTotalPayout: newTotalPayout,
                    extendedAt: new Date().toISOString(),
                });

                onUpdateDeal({
                    ...dealData,
                    amount: `€${fmtEur(newTotalPayout)}`,
                    dueDate: formattedDueDate,
                    specialNote: `EXTENSION_META:${meta}`,
                });
            }
            onClose();
        }, 1500);
    };

    const canContinue = (() => {
        if (step === 3) {
            if (adjustmentMode === 'none') return true;
            if (adjustmentMode === 'payback') {
                return adjustmentAmountNum > 0 && adjustmentAmountNum <= currentPayout;
            }
            if (adjustmentMode === 'payout') {
                return adjustmentAmountNum > 0 && adjustmentAmountNum <= additionalPossible;
            }
        }
        if (step === 4) {
            if (isNotesRequired) return false;
            if (finalParentFees < 0 || feeComponents.some(c => isNaN(c.amount) || c.amount < 0)) return false;
            return true;
        }
        return true;
    })();

    const cashBookOptions = dealData.countryCode === 'DE' ? [
        { label: 'Munich Main Cash', value: 'Munich Main Cash' },
        { label: 'Berlin Main Cash', value: 'Berlin Main Cash' }
    ] : [
        { label: 'Vienna Main Cash', value: 'Vienna Main Cash' },
        { label: 'Vienna Safe Cash', value: 'Vienna Safe Cash' },
        { label: 'Graz Main Cash', value: 'Graz Main Cash' }
    ];

    const renderStep1 = () => {
        return (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <p className="text-[13px] text-[var(--text-subtle)] leading-relaxed">
                    Review the current deal details before proceeding with the extension.
                </p>
                <div className="bg-[var(--background-secondary)]/40 rounded-xl border border-[var(--border-subtlest)] overflow-hidden">
                    {[
                        { label: 'Current Payout', value: `€ ${fmtEur(currentPayout)}` },
                        { label: 'Due Date', value: dealData.dueDate || '—' },
                        { label: 'Duration', value: currentDuration ? `${currentDuration} days` : (dealData.wizardData?.dealDuration || '—') },
                        { label: 'Est. Item Market Value', value: `€ ${fmtEur(mockMarketValue)}` },
                    ].map(({ label, value }, i, arr) => (
                        <div key={label} className={`flex justify-between items-center px-5 py-3.5 ${i < arr.length - 1 ? 'border-b border-[var(--border-subtlest)]' : ''}`}>
                            <span className="text-[13px] text-[var(--text-subtle)] font-medium">{label}</span>
                            <span className="text-[13px] font-bold text-[var(--text-primary)]">{value}</span>
                        </div>
                    ))}
                </div>
                {dealData.items.length > 0 && (
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-subtlest)] mb-2">Collateral Items</p>
                        <div className="space-y-1.5">
                            {dealData.items.map((item, i) => (
                                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-[var(--background-secondary)] rounded-lg border border-[var(--border-subtlest)]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-500)] shrink-0" />
                                    <span className="text-[13px] font-semibold text-[var(--text-primary)]">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderStep2 = () => {
        return (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <p className="text-[13px] text-[var(--text-subtle)] leading-relaxed">
                    Select the number of additional days to extend this pawn deal.
                </p>
                <Dropdown
                    label="Extend By (Days)"
                    value={extensionDays}
                    onChange={(val) => setExtensionDays(val)}
                    options={[
                        { label: '30 Days', value: '30' },
                        { label: '60 Days', value: '60' },
                        { label: '90 Days', value: '90' },
                    ]}
                />
                <div className="p-4 bg-[var(--background-brand-primary)] border border-[var(--border-brand-subtle)] rounded-xl flex items-center gap-3">
                    <CalendarIcon size={20} className="text-[var(--text-brand)] shrink-0" />
                    <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--text-brand)]">New Due Date</span>
                        <p className="text-[16px] font-extrabold text-[var(--text-brand)] mt-0.5">{fmtDate(newDueDate)}</p>
                        <p className="text-[11px] text-[var(--text-brand)]/70 font-medium mt-0.5">Extended from {dealData.dueDate || '—'} by {extensionDays} days</p>
                    </div>
                </div>
                <div className="p-4 bg-[var(--background-secondary)]/40 border border-[var(--border-subtlest)] rounded-xl">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-subtlest)] block mb-1">Base Parent Fees Accumulated</span>
                    <p className="text-[18px] font-black text-[var(--text-primary)]">€ {fmtEur(calculatedBaseFees)}</p>
                    <p className="text-[11px] text-[var(--text-subtlest)] mt-1.5">
                        Calculated at 4% for {elapsedDays} elapsed days on current payout of € {fmtEur(currentPayout)}.
                    </p>
                </div>
            </div>
        );
    };

    const renderStep3 = () => {
        return (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <p className="text-[13px] text-[var(--text-subtle)] leading-relaxed">
                    Configure any loan adjustments to the pawn principal.
                </p>
                <div className="space-y-3">
                    {[
                        { value: 'none', label: 'No Adjustment', sub: 'Extend due date only. Keep the current payout principal.' },
                        { value: 'payback', label: 'Partial Payback (Redemption)', sub: 'Customer pays back a portion of the loan principal today.' },
                        { value: 'payout', label: 'Request Additional Payout', sub: `Disburse extra funds today. Up to € ${fmtEur(additionalPossible)} available based on current LTV.` },
                    ].map(({ value, label, sub }) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => {
                                setAdjustmentMode(value as 'none' | 'payback' | 'payout');
                                setAdjustmentAmountInput('');
                            }}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-150 ${
                                adjustmentMode === value
                                    ? 'border-[var(--border-brand)] bg-[var(--background-brand-primary)]'
                                    : 'border-[var(--border-subtlest)] bg-[var(--background-secondary)]/30 hover:border-[var(--border-brand-subtle)]'
                            } cursor-pointer`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                    adjustmentMode === value ? 'border-[var(--border-brand)] bg-[var(--background-brand-solid)]' : 'border-[var(--border-subtle)]'
                                }`}>
                                    {adjustmentMode === value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>
                                <div>
                                    <p className={`text-[13px] font-bold ${adjustmentMode === value ? 'text-[var(--text-brand)]' : 'text-[var(--text-primary)]'}`}>{label}</p>
                                    <p className="text-[11px] text-[var(--text-subtle)] mt-0.5">{sub}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {adjustmentMode !== 'none' && (
                    <div className="space-y-3 pt-2">
                        <Input
                            label={adjustmentMode === 'payback' ? 'Redemption Amount (€)' : 'Additional Payout Amount (€)'}
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="0.00"
                            value={adjustmentAmountInput}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdjustmentAmountInput(e.target.value)}
                            error={
                                adjustmentMode === 'payback' 
                                    ? (adjustmentAmountNum > currentPayout || (adjustmentAmountNum <= 0 && adjustmentAmountInput !== ''))
                                    : (adjustmentAmountNum > additionalPossible || (adjustmentAmountNum <= 0 && adjustmentAmountInput !== ''))
                            }
                            errorMessage={
                                adjustmentMode === 'payback' 
                                    ? `Must be between €0.01 and €${fmtEur(currentPayout)}`
                                    : `Must be between €0.01 and €${fmtEur(additionalPossible)}`
                            }
                        />
                        {adjustmentAmountNum > 0 && (
                            <div className="p-3 bg-[var(--background-secondary)] rounded-xl border border-[var(--border-subtlest)] flex justify-between items-center text-xs">
                                <span className="text-[var(--text-subtle)] font-medium">New Total Loan Principal</span>
                                <span className="text-[var(--text-primary)] font-bold">€ {fmtEur(newTotalPayout)}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const renderChildFeeStructureOverrides = () => {
        const childDealComps = childFeeComponents.filter(c => c.level === 'deal');

        const toggleEditChildDeal = () => {
            setIsEditingChildDeal(!isEditingChildDeal);
        };

        return (
            <div className="space-y-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center gap-2 pb-1 border-b border-[var(--border-subtlest)]">
                    <span className="w-1.5 h-3 bg-amber-500 rounded-full" />
                    <h3 className="text-[13px] font-extrabold uppercase tracking-wide text-[var(--text-primary)]">Child Deal Fee Structure Overrides</h3>
                </div>

                {/* Deal Level Fees */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-[11px] font-black uppercase tracking-widest text-[var(--text-subtlest)]">Deal Level Fees</span>
                        <button
                            type="button"
                            onClick={toggleEditChildDeal}
                            className={`text-[11px] font-bold ${
                                isEditingChildDeal ? 'text-[var(--text-success)]' : 'text-[var(--text-brand)]'
                            } underline flex items-center gap-1 cursor-pointer bg-transparent border-0 outline-none`}
                        >
                            {isEditingChildDeal ? 'Done Editing' : 'Edit'}
                        </button>
                    </div>
                    <div className="border border-[var(--border-subtlest)] rounded-lg overflow-hidden bg-white/5">
                        <table className="w-full text-left border-collapse text-[12px] table-layout-fixed" style={{ tableLayout: 'fixed' }}>
                            <colgroup>
                                <col className="w-[45%]" />
                                <col className="w-[20%]" />
                                <col className="w-[15%]" />
                                <col className="w-[20%]" />
                            </colgroup>
                            <thead>
                                <tr className="bg-[var(--background-secondary)]/60 text-[var(--text-subtle)] border-b border-[var(--border-subtlest)] font-bold">
                                    <th className="px-4 py-2">Fee Component</th>
                                    <th className="px-3 py-2 text-right">NET</th>
                                    <th className="px-3 py-2 text-right">VAT</th>
                                    <th className="px-3 py-2 text-right">Amount (Gross)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {childDealComps.map((comp) => {
                                    const amount = isNaN(comp.amount) ? 0 : comp.amount;
                                    const taxRate = isNaN(comp.taxRate) ? 0 : comp.taxRate;
                                    const netAmount = taxRate === -100 ? 0 : amount / (1 + taxRate / 100);
                                    return (
                                        <tr key={comp.id} className="border-b border-[var(--border-subtlest)] hover:bg-[var(--background-secondary)]/20 transition-colors">
                                            <td className="px-4 py-2.5">
                                                {isEditingChildDeal ? (
                                                    comp.isDefault ? (
                                                        <span className="font-normal text-[var(--text-primary)]">{comp.type}</span>
                                                    ) : (
                                                        <div className="w-full">
                                                            {comp.type === 'Other' && !selectModeChildIds.has(comp.id) ? (
                                                                <div className="flex items-center gap-1">
                                                                    <button type="button" onClick={() => enterChildSelectMode(comp.id)} className="text-[var(--text-subtlest)] hover:text-[var(--text-brand)] transition-colors flex-shrink-0" title="Change type">
                                                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7.5 2L4 6l3.5 4"/></svg>
                                                                    </button>
                                                                    <input
                                                                        type="text"
                                                                        autoFocus
                                                                        className="flex-1 text-[12px] px-2 py-1.5 bg-[var(--background-primary)] border border-[var(--border-brand)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--brand-500)] text-[var(--text-primary)] font-normal"
                                                                        placeholder="Custom fee name…"
                                                                        value={comp.customName || ''}
                                                                        onChange={(e) => handleUpdateChildComponent(comp.id, { customName: e.target.value })}
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <select
                                                                    className="bg-[var(--background-primary)] border border-[var(--border-subtle)] text-[12px] rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--brand-500)] text-[var(--text-primary)] w-full font-normal"
                                                                    value={comp.type}
                                                                    onChange={(e) => { handleUpdateChildComponent(comp.id, { type: e.target.value }); if (e.target.value === 'Other') exitChildSelectMode(comp.id); }}
                                                                >
                                                                    {DEAL_FEE_TYPES.map(t => (
                                                                        <option key={t} value={t} disabled={childFeeComponents.some(c => c.level === 'deal' && c.id !== comp.id && c.type === t && t !== 'Other')}>{t}</option>
                                                                    ))}
                                                                </select>
                                                            )}
                                                        </div>
                                                    )
                                                ) : (
                                                    <span className="font-normal text-[var(--text-primary)]">
                                                        {comp.type === 'Other' ? (comp.customName || 'Other') : comp.type}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2.5 text-right font-medium text-[var(--text-subtle)]">
                                                € {fmtEur(netAmount)}
                                            </td>
                                            <td className="px-3 py-2.5 text-right font-normal text-[var(--text-primary)]">
                                                {isEditingChildDeal ? (
                                                    <div className="relative flex items-center justify-end w-[70px] ml-auto">
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            className="w-full text-[12px] pr-5 pl-2 py-1 bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--brand-500)] text-[var(--text-primary)] font-normal text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                            value={isNaN(comp.taxRate) ? '' : comp.taxRate}
                                                            onChange={(e) => handleUpdateChildComponent(comp.id, { taxRate: parseFloat(e.target.value) })}
                                                        />
                                                        <span className="absolute right-1.5 text-[var(--text-subtle)] text-[12px] font-semibold select-none">%</span>
                                                    </div>
                                                ) : (
                                                    `${taxRate}%`
                                                )}
                                            </td>
                                            <td className="px-3 py-2.5 text-right font-normal text-[var(--text-primary)]">
                                                {isEditingChildDeal ? (
                                                    <div className="flex items-center gap-1.5 justify-end">
                                                        <div className="relative flex items-center justify-end w-[100px]">
                                                            <span className="absolute left-2.5 text-[var(--text-subtle)] text-[12px] font-semibold select-none">€</span>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                className="w-full text-[12px] pl-6 pr-2 py-1 bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--brand-500)] text-[var(--text-primary)] font-normal text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                value={isNaN(comp.amount) ? '' : comp.amount}
                                                                onChange={(e) => handleUpdateChildComponent(comp.id, { amount: parseFloat(e.target.value) })}
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteChildComponent(comp.id)}
                                                            className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 rounded text-[var(--text-subtlest)] transition-colors cursor-pointer flex-shrink-0"
                                                            title="Delete"
                                                        >
                                                            <TrashIcon size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    `€ ${fmtEur(comp.amount)}`
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {/* Subtotal Row inside Table */}
                                <tr className="bg-[var(--background-secondary)]/30 border-t border-[var(--border-subtlest)] font-bold text-[12px]">
                                    <td className="px-4 py-2.5">
                                        {isEditingChildDeal && (
                                            <button
                                                type="button"
                                                onClick={handleAddChildDealFeeComponent}
                                                className="text-[11px] font-bold text-[var(--text-brand)] hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-0 outline-none"
                                            >
                                                <PlusIcon size={12} /> Add Deal Fee Component
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-3 py-2.5 text-right text-[var(--text-primary)]">
                                        € {fmtEur(childFeeComponents.filter(c => c.level === 'deal').reduce((sum, c) => {
                                            const amt = isNaN(c.amount) ? 0 : c.amount;
                                            const rate = isNaN(c.taxRate) ? 0 : c.taxRate;
                                            return sum + (rate === -100 ? 0 : amt / (1 + rate / 100));
                                        }, 0))}
                                    </td>
                                    <td className="px-3 py-2.5"></td>
                                    <td className="px-3 py-2.5 text-right text-[var(--text-primary)]">
                                        € {fmtEur(childFeeComponents.filter(c => c.level === 'deal').reduce((sum, c) => sum + (isNaN(c.amount) ? 0 : c.amount), 0))}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Item Level Fees */}
                <div className="space-y-3">
                    <span className="text-[11px] font-black uppercase tracking-widest text-[var(--text-subtlest)] block">Item Level Fees</span>
                    {dealData.items.map((itemName, itemIdx) => {
                        const itemComps = childFeeComponents.filter(c => c.level === 'item' && c.itemId === itemName);
                        const isEditingItem = editingChildItemIds.includes(itemName);
                        
                        const toggleEditItem = () => {
                            if (isEditingItem) {
                                setEditingChildItemIds(editingChildItemIds.filter(id => id !== itemName));
                            } else {
                                setEditingChildItemIds([...editingChildItemIds, itemName]);
                            }
                        };

                        const itemGrossSubtotal = itemComps.reduce((sum, c) => sum + (isNaN(c.amount) ? 0 : c.amount), 0);
                        const itemNetSubtotal = itemComps.reduce((sum, c) => {
                            const amt = isNaN(c.amount) ? 0 : c.amount;
                            const rate = isNaN(c.taxRate) ? 0 : c.taxRate;
                            return sum + (rate === -100 ? 0 : amt / (1 + rate / 100));
                        }, 0);

                        return (
                            <div key={`child-item-card-${itemIdx}`} className="bg-[var(--background-secondary)]/20 rounded-xl border border-[var(--border-subtlest)] p-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-[12px] font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                        Item: {itemName}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={toggleEditItem}
                                        className={`text-[11px] font-bold ${
                                            isEditingItem ? 'text-[var(--text-success)]' : 'text-[var(--text-brand)]'
                                        } underline flex items-center gap-1 cursor-pointer bg-transparent border-0 outline-none`}
                                    >
                                        {isEditingItem ? 'Done Editing' : 'Edit'}
                                    </button>
                                </div>
                                <div className="border border-[var(--border-subtlest)] rounded-lg overflow-hidden bg-white/5">
                                    <table className="w-full text-left border-collapse text-[12px] table-layout-fixed" style={{ tableLayout: 'fixed' }}>
                                        <colgroup>
                                            <col className="w-[45%]" />
                                            <col className="w-[20%]" />
                                            <col className="w-[15%]" />
                                            <col className="w-[20%]" />
                                        </colgroup>
                                        <thead>
                                            <tr className="bg-[var(--background-secondary)]/40 text-[var(--text-subtle)] border-b border-[var(--border-subtlest)] font-bold">
                                                <th className="px-4 py-2">Fee Component</th>
                                                <th className="px-3 py-2 text-right">NET</th>
                                                <th className="px-3 py-2 text-right">VAT</th>
                                                <th className="px-3 py-2 text-right">Amount (Gross)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {itemComps.map((comp) => {
                                                const amount = isNaN(comp.amount) ? 0 : comp.amount;
                                                const taxRate = isNaN(comp.taxRate) ? 0 : comp.taxRate;
                                                const netAmount = taxRate === -100 ? 0 : amount / (1 + taxRate / 100);
                                                return (
                                                    <tr key={comp.id} className="border-b border-[var(--border-subtlest)] hover:bg-[var(--background-secondary)]/20 transition-colors">
                                                        <td className="px-4 py-2.5">
                                                            {isEditingItem ? (
                                                                comp.isDefault ? (
                                                                    <span className="font-normal text-[var(--text-primary)]">{comp.type}</span>
                                                                ) : (
                                                                    <div className="w-full">
                                                                        {comp.type === 'Other' && !selectModeChildIds.has(comp.id) ? (
                                                                            <div className="flex items-center gap-1">
                                                                                <button type="button" onClick={() => enterChildSelectMode(comp.id)} className="text-[var(--text-subtlest)] hover:text-[var(--text-brand)] transition-colors flex-shrink-0" title="Change type">
                                                                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7.5 2L4 6l3.5 4"/></svg>
                                                                                </button>
                                                                                <input
                                                                                    type="text"
                                                                                    autoFocus
                                                                                    className="flex-1 text-[12px] px-2 py-1.5 bg-[var(--background-primary)] border border-[var(--border-brand)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--brand-500)] text-[var(--text-primary)] font-normal"
                                                                                    placeholder="Custom fee name…"
                                                                                    value={comp.customName || ''}
                                                                                    onChange={(e) => handleUpdateChildComponent(comp.id, { customName: e.target.value })}
                                                                                />
                                                                            </div>
                                                                        ) : (
                                                                            <select
                                                                                className="bg-[var(--background-primary)] border border-[var(--border-subtle)] text-[12px] rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--brand-500)] text-[var(--text-primary)] w-full font-normal"
                                                                                value={comp.type}
                                                                                onChange={(e) => { handleUpdateChildComponent(comp.id, { type: e.target.value }); if (e.target.value === 'Other') exitChildSelectMode(comp.id); }}
                                                                            >
                                                                                {ITEM_FEE_TYPES.map(t => (
                                                                                    <option key={t} value={t} disabled={childFeeComponents.some(c => c.level === 'item' && c.itemId === comp.itemId && c.id !== comp.id && c.type === t && t !== 'Other')}>{t}</option>
                                                                                ))}
                                                                            </select>
                                                                        )}
                                                                    </div>
                                                                )
                                                            ) : (
                                                                <span className="font-normal text-[var(--text-primary)]">
                                                                    {comp.type === 'Other' ? (comp.customName || 'Other') : comp.type}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-2.5 text-right font-medium text-[var(--text-subtle)]">
                                                            € {fmtEur(netAmount)}
                                                        </td>
                                                        <td className="px-3 py-2.5 text-right font-normal text-[var(--text-primary)]">
                                                            {isEditingItem ? (
                                                                <div className="relative flex items-center justify-end w-[65px] ml-auto">
                                                                    <input
                                                                        type="number"
                                                                        step="0.1"
                                                                        className="w-full text-[12px] pr-5 pl-2 py-1 bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--brand-500)] text-[var(--text-primary)] font-normal text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                        value={isNaN(comp.taxRate) ? '' : comp.taxRate}
                                                                        onChange={(e) => handleUpdateChildComponent(comp.id, { taxRate: parseFloat(e.target.value) })}
                                                                    />
                                                                    <span className="absolute right-1.5 text-[var(--text-subtle)] text-[12px] font-semibold select-none">%</span>
                                                                </div>
                                                            ) : (
                                                                `${taxRate}%`
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-2.5 text-right font-normal text-[var(--text-primary)]">
                                                            {isEditingItem ? (
                                                                <div className="flex items-center gap-1 justify-end">
                                                                    <div className="relative flex items-center justify-end w-[90px]">
                                                                        <span className="absolute left-2.5 text-[var(--text-subtle)] text-[12px] font-semibold select-none">€</span>
                                                                        <input
                                                                            type="number"
                                                                            step="0.01"
                                                                            className="w-full text-[12px] pl-6 pr-2 py-1 bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--brand-500)] text-[var(--text-primary)] font-normal text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                            value={isNaN(comp.amount) ? '' : comp.amount}
                                                                            onChange={(e) => handleUpdateChildComponent(comp.id, { amount: parseFloat(e.target.value) })}
                                                                        />
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleDeleteChildComponent(comp.id)}
                                                                        className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 rounded text-[var(--text-subtlest)] transition-colors cursor-pointer flex-shrink-0"
                                                                        title="Delete"
                                                                    >
                                                                        <TrashIcon size={14} />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                `€ ${fmtEur(comp.amount)}`
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {/* Subtotal Row inside Table */}
                                            <tr className="bg-[var(--background-secondary)]/30 border-t border-[var(--border-subtlest)] font-bold text-[12px]">
                                                <td className="px-4 py-2.5">
                                                    {isEditingItem && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAddChildItemFeeComponent(itemName)}
                                                            className="text-[11px] font-bold text-[var(--text-brand)] hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-0 outline-none"
                                                        >
                                                            <PlusIcon size={12} /> Add Item Fee
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2.5 text-right text-[var(--text-primary)]">
                                                    € {fmtEur(itemNetSubtotal)}
                                                </td>
                                                <td className="px-3 py-2.5"></td>
                                                <td className="px-3 py-2.5 text-right text-[var(--text-primary)]">
                                                    € {fmtEur(itemGrossSubtotal)}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderStep4 = () => {
        return (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-start border-b border-[var(--border-subtlest)] pb-4 gap-4">
                    <div className="pr-6 max-w-[75%]">
                        <h3 className="text-[13px] font-bold text-[var(--text-primary)] mb-1">Maturity & Fee Adjustments</h3>
                        <p className="text-[11px] text-[var(--text-subtle)] leading-relaxed">
                            Review and edit calculated maturity fees at the deal and item levels. Add extra components as needed.
                        </p>
                    </div>
                    <div className="text-right shrink-0 mt-0.5">
                        <span className="text-[9px] uppercase font-black tracking-widest text-[var(--text-subtlest)] block mb-0.5">Total Fees</span>
                        <span className="text-[16px] font-extrabold text-[var(--text-primary)]">€ {fmtEur(finalParentFees)}</span>
                    </div>
                </div>
                
                {/* Deal Level Fees */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-[11px] font-black uppercase tracking-widest text-[var(--text-subtlest)] block">Deal Level Fees</span>
                        <button
                            type="button"
                            onClick={() => setIsEditingDeal(!isEditingDeal)}
                            className={`text-[11px] font-bold ${
                                isEditingDeal ? 'text-[var(--text-success)]' : 'text-[var(--text-brand)]'
                            } underline flex items-center gap-1 cursor-pointer bg-transparent border-0 outline-none`}
                        >
                            {isEditingDeal ? 'Done Editing' : 'Edit'}
                        </button>
                    </div>
                    
                    <div className="border border-[var(--border-subtlest)] rounded-xl overflow-hidden bg-[var(--background-secondary)]/10">
                        <table className="w-full text-left border-collapse text-[12px] table-layout-fixed" style={{ tableLayout: 'fixed' }}>
                            <colgroup>
                                <col className="w-[45%]" />
                                <col className="w-[20%]" />
                                <col className="w-[15%]" />
                                <col className="w-[20%]" />
                            </colgroup>
                            <thead>
                                <tr className="bg-[var(--background-secondary)]/60 text-[var(--text-subtle)] border-b border-[var(--border-subtlest)] font-bold">
                                    <th className="px-4 py-2">Fee Component</th>
                                    <th className="px-3 py-2 text-right">NET</th>
                                    <th className="px-3 py-2 text-right">VAT</th>
                                    <th className="px-3 py-2 text-right">Amount (Gross)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {feeComponents.filter(c => c.level === 'deal').map((comp) => {
                                    const amount = isNaN(comp.amount) ? 0 : comp.amount;
                                    const taxRate = isNaN(comp.taxRate) ? 0 : comp.taxRate;
                                    const netAmount = taxRate === -100 ? 0 : amount / (1 + taxRate / 100);
                                    return (
                                        <tr key={comp.id} className="border-b border-[var(--border-subtlest)] hover:bg-[var(--background-secondary)]/20 transition-colors">
                                            <td className="px-4 py-2.5">
                                                {isEditingDeal ? (
                                                    comp.isDefault ? (
                                                        <span className="font-normal text-[var(--text-primary)]">{comp.type}</span>
                                                    ) : (
                                                        <div className="w-full">
                                                            {comp.type === 'Other' && !selectModeIds.has(comp.id) ? (
                                                                <div className="flex items-center gap-1">
                                                                    <button type="button" onClick={() => enterSelectMode(comp.id)} className="text-[var(--text-subtlest)] hover:text-[var(--text-brand)] transition-colors flex-shrink-0" title="Change type">
                                                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7.5 2L4 6l3.5 4"/></svg>
                                                                    </button>
                                                                    <input
                                                                        type="text"
                                                                        autoFocus
                                                                        className="flex-1 text-[12px] px-2 py-1.5 bg-[var(--background-primary)] border border-[var(--border-brand)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--brand-500)] text-[var(--text-primary)] font-normal"
                                                                        placeholder="Custom fee name…"
                                                                        value={comp.customName || ''}
                                                                        onChange={(e) => handleUpdateComponent(comp.id, { customName: e.target.value })}
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <select
                                                                    className="bg-[var(--background-primary)] border border-[var(--border-subtle)] text-[12px] rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--brand-500)] text-[var(--text-primary)] w-full font-normal"
                                                                    value={comp.type}
                                                                    onChange={(e) => { handleUpdateComponent(comp.id, { type: e.target.value }); if (e.target.value === 'Other') exitSelectMode(comp.id); }}
                                                                >
                                                                    {DEAL_FEE_TYPES.map(t => (
                                                                        <option key={t} value={t} disabled={feeComponents.some(c => c.level === 'deal' && c.id !== comp.id && c.type === t && t !== 'Other')}>{t}</option>
                                                                    ))}
                                                                </select>
                                                            )}
                                                        </div>
                                                    )
                                                ) : (
                                                    <span className="font-normal text-[var(--text-primary)]">
                                                        {comp.type === 'Other' ? (comp.customName || 'Other') : comp.type}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2.5 text-right font-medium text-[var(--text-subtle)]">
                                                € {fmtEur(netAmount)}
                                            </td>
                                            <td className="px-3 py-2.5 text-right font-normal text-[var(--text-primary)]">
                                                {isEditingDeal ? (
                                                    <div className="relative flex items-center justify-end w-[70px] ml-auto">
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            className="w-full text-[12px] pr-5 pl-2 py-1 bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--brand-500)] text-[var(--text-primary)] font-normal text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                            value={isNaN(comp.taxRate) ? '' : comp.taxRate}
                                                            onChange={(e) => handleUpdateComponent(comp.id, { taxRate: parseFloat(e.target.value) })}
                                                        />
                                                        <span className="absolute right-1.5 text-[var(--text-subtle)] text-[12px] font-semibold select-none">%</span>
                                                    </div>
                                                ) : (
                                                    `${taxRate}%`
                                                )}
                                            </td>
                                            <td className="px-3 py-2.5 text-right font-normal text-[var(--text-primary)]">
                                                {isEditingDeal ? (
                                                    <div className="flex items-center gap-1.5 justify-end">
                                                        <div className="relative flex items-center justify-end w-[100px]">
                                                            <span className="absolute left-2.5 text-[var(--text-subtle)] text-[12px] font-semibold select-none">€</span>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                className="w-full text-[12px] pl-6 pr-2 py-1 bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--brand-500)] text-[var(--text-primary)] font-normal text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                value={isNaN(comp.amount) ? '' : comp.amount}
                                                                onChange={(e) => handleUpdateComponent(comp.id, { amount: parseFloat(e.target.value) })}
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteComponent(comp.id)}
                                                            className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 rounded text-[var(--text-subtlest)] transition-colors cursor-pointer flex-shrink-0"
                                                            title="Delete"
                                                        >
                                                            <TrashIcon size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    `€ ${fmtEur(comp.amount)}`
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {/* Subtotal Row inside Table */}
                                <tr className="bg-[var(--background-secondary)]/30 border-t border-[var(--border-subtlest)] font-bold text-[12px]">
                                    <td className="px-4 py-2.5">
                                        {isEditingDeal && (
                                            <button
                                                type="button"
                                                onClick={handleAddDealFeeComponent}
                                                className="text-[11px] font-bold text-[var(--text-brand)] hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-0 outline-none"
                                            >
                                                <PlusIcon size={12} /> Add Deal Fee Component
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-3 py-2.5 text-right text-[var(--text-primary)]">
                                        € {fmtEur(feeComponents.filter(c => c.level === 'deal').reduce((sum, c) => {
                                            const amt = isNaN(c.amount) ? 0 : c.amount;
                                            const rate = isNaN(c.taxRate) ? 0 : c.taxRate;
                                            return sum + (rate === -100 ? 0 : amt / (1 + rate / 100));
                                        }, 0))}
                                    </td>
                                    <td className="px-3 py-2.5"></td>
                                    <td className="px-3 py-2.5 text-right text-[var(--text-primary)]">
                                        € {fmtEur(feeComponents.filter(c => c.level === 'deal').reduce((sum, c) => sum + (isNaN(c.amount) ? 0 : c.amount), 0))}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Item Level Fees */}
                <div className="space-y-3">
                    <span className="text-[11px] font-black uppercase tracking-widest text-[var(--text-subtlest)] block">Item Level Fees</span>
                    {dealData.items.map((itemName, itemIdx) => {
                        const itemComps = feeComponents.filter(c => c.level === 'item' && c.itemId === itemName);
                        const isEditingItem = editingItemIds.includes(itemName);
                        
                        const toggleEditItem = () => {
                            if (isEditingItem) {
                                setEditingItemIds(editingItemIds.filter(id => id !== itemName));
                            } else {
                                setEditingItemIds([...editingItemIds, itemName]);
                            }
                        };

                        const itemGrossSubtotal = itemComps.reduce((sum, c) => sum + (isNaN(c.amount) ? 0 : c.amount), 0);
                        const itemNetSubtotal = itemComps.reduce((sum, c) => {
                            const amt = isNaN(c.amount) ? 0 : c.amount;
                            const rate = isNaN(c.taxRate) ? 0 : c.taxRate;
                            return sum + (rate === -100 ? 0 : amt / (1 + rate / 100));
                        }, 0);

                        return (
                            <div key={`item-card-${itemIdx}`} className="bg-[var(--background-secondary)]/20 rounded-xl border border-[var(--border-subtlest)] p-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-[12px] font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-500)]" />
                                        Item: {itemName}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={toggleEditItem}
                                        className={`text-[11px] font-bold ${
                                            isEditingItem ? 'text-[var(--text-success)]' : 'text-[var(--text-brand)]'
                                        } underline flex items-center gap-1 cursor-pointer bg-transparent border-0 outline-none`}
                                    >
                                        {isEditingItem ? 'Done Editing' : 'Edit'}
                                    </button>
                                </div>
                                <div className="border border-[var(--border-subtlest)] rounded-lg overflow-hidden bg-white/5">
                                    <table className="w-full text-left border-collapse text-[12px] table-layout-fixed" style={{ tableLayout: 'fixed' }}>
                                        <colgroup>
                                            <col className="w-[45%]" />
                                            <col className="w-[20%]" />
                                            <col className="w-[15%]" />
                                            <col className="w-[20%]" />
                                        </colgroup>
                                        <thead>
                                            <tr className="bg-[var(--background-secondary)]/40 text-[var(--text-subtle)] border-b border-[var(--border-subtlest)] font-bold">
                                                <th className="px-4 py-2">Fee Component</th>
                                                <th className="px-3 py-2 text-right">NET</th>
                                                <th className="px-3 py-2 text-right">VAT</th>
                                                <th className="px-3 py-2 text-right">Amount (Gross)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {itemComps.map((comp) => {
                                                const amount = isNaN(comp.amount) ? 0 : comp.amount;
                                                const taxRate = isNaN(comp.taxRate) ? 0 : comp.taxRate;
                                                const netAmount = taxRate === -100 ? 0 : amount / (1 + taxRate / 100);
                                                return (
                                                    <tr key={comp.id} className="border-b border-[var(--border-subtlest)] hover:bg-[var(--background-secondary)]/20 transition-colors">
                                                        <td className="px-4 py-2.5">
                                                            {isEditingItem ? (
                                                                comp.isDefault ? (
                                                                    <span className="font-normal text-[var(--text-primary)]">{comp.type}</span>
                                                                ) : (
                                                                    <div className="w-full">
                                                                        {comp.type === 'Other' && !selectModeIds.has(comp.id) ? (
                                                                            <div className="flex items-center gap-1">
                                                                                <button type="button" onClick={() => enterSelectMode(comp.id)} className="text-[var(--text-subtlest)] hover:text-[var(--text-brand)] transition-colors flex-shrink-0" title="Change type">
                                                                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7.5 2L4 6l3.5 4"/></svg>
                                                                                </button>
                                                                                <input
                                                                                    type="text"
                                                                                    autoFocus
                                                                                    className="flex-1 text-[12px] px-2 py-1.5 bg-[var(--background-primary)] border border-[var(--border-brand)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--brand-500)] text-[var(--text-primary)] font-normal"
                                                                                    placeholder="Custom fee name…"
                                                                                    value={comp.customName || ''}
                                                                                    onChange={(e) => handleUpdateComponent(comp.id, { customName: e.target.value })}
                                                                                />
                                                                            </div>
                                                                        ) : (
                                                                            <select
                                                                                className="bg-[var(--background-primary)] border border-[var(--border-subtle)] text-[12px] rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--brand-500)] text-[var(--text-primary)] w-full font-normal"
                                                                                value={comp.type}
                                                                                onChange={(e) => { handleUpdateComponent(comp.id, { type: e.target.value }); if (e.target.value === 'Other') exitSelectMode(comp.id); }}
                                                                            >
                                                                                {ITEM_FEE_TYPES.map(t => (
                                                                                    <option key={t} value={t} disabled={feeComponents.some(c => c.level === 'item' && c.itemId === comp.itemId && c.id !== comp.id && c.type === t && t !== 'Other')}>{t}</option>
                                                                                ))}
                                                                            </select>
                                                                        )}
                                                                    </div>
                                                                )
                                                            ) : (
                                                                <span className="font-normal text-[var(--text-primary)]">
                                                                    {comp.type === 'Other' ? (comp.customName || 'Other') : comp.type}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-2.5 text-right font-medium text-[var(--text-subtle)]">
                                                            € {fmtEur(netAmount)}
                                                        </td>
                                                        <td className="px-3 py-2.5 text-right font-normal text-[var(--text-primary)]">
                                                            {isEditingItem ? (
                                                                <div className="relative flex items-center justify-end w-[65px] ml-auto">
                                                                    <input
                                                                        type="number"
                                                                        step="0.1"
                                                                        className="w-full text-[12px] pr-5 pl-2 py-1 bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--brand-500)] text-[var(--text-primary)] font-normal text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                        value={isNaN(comp.taxRate) ? '' : comp.taxRate}
                                                                        onChange={(e) => handleUpdateComponent(comp.id, { taxRate: parseFloat(e.target.value) })}
                                                                    />
                                                                    <span className="absolute right-1.5 text-[var(--text-subtle)] text-[12px] font-semibold select-none">%</span>
                                                                </div>
                                                            ) : (
                                                                `${taxRate}%`
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-2.5 text-right font-normal text-[var(--text-primary)]">
                                                            {isEditingItem ? (
                                                                <div className="flex items-center gap-1 justify-end">
                                                                    <div className="relative flex items-center justify-end w-[90px]">
                                                                        <span className="absolute left-2.5 text-[var(--text-subtle)] text-[12px] font-semibold select-none">€</span>
                                                                        <input
                                                                            type="number"
                                                                            step="0.01"
                                                                            className="w-full text-[12px] pl-6 pr-2 py-1 bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--brand-500)] text-[var(--text-primary)] font-normal text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                            value={isNaN(comp.amount) ? '' : comp.amount}
                                                                            onChange={(e) => handleUpdateComponent(comp.id, { amount: parseFloat(e.target.value) })}
                                                                        />
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleDeleteComponent(comp.id)}
                                                                        className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 rounded text-[var(--text-subtlest)] transition-colors cursor-pointer flex-shrink-0"
                                                                        title="Delete"
                                                                    >
                                                                        <TrashIcon size={14} />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                `€ ${fmtEur(comp.amount)}`
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {/* Subtotal Row inside Table */}
                                            <tr className="bg-[var(--background-secondary)]/30 border-t border-[var(--border-subtlest)] font-bold text-[12px]">
                                                <td className="px-4 py-2.5">
                                                    {isEditingItem && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAddItemFeeComponent(itemName)}
                                                            className="text-[11px] font-bold text-[var(--text-brand)] hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-0 outline-none"
                                                        >
                                                            <PlusIcon size={12} /> Add Item Fee
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2.5 text-right text-[var(--text-primary)]">
                                                    € {fmtEur(itemNetSubtotal)}
                                                </td>
                                                <td className="px-3 py-2.5"></td>
                                                <td className="px-3 py-2.5 text-right text-[var(--text-primary)]">
                                                    € {fmtEur(itemGrossSubtotal)}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Notes / Justification Section */}
                {isFeesOverridden && (
                    <div className="flex flex-col">
                        <label className="text-[12px] font-bold text-[var(--text-primary)] mb-1.5 flex items-center justify-between">
                            <span>Notes / Justification <span className="text-red-500">*</span></span>
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded border border-amber-200">
                                Adjustment Reason Required
                            </span>
                        </label>
                        <textarea
                            className={`w-full text-[13px] px-3.5 py-3 bg-white dark:bg-[#1f2937] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] text-[var(--text-primary)] transition-all min-h-[75px] ${
                                isNotesRequired ? 'border-red-300 bg-red-50/10' : 'border-[var(--border-subtle)]'
                            }`}
                            placeholder="Enter operator reason for fee adjustment..."
                            value={feeOverrideReason}
                            onChange={(e) => setFeeOverrideReason(e.target.value)}
                        />
                        {isNotesRequired && (
                            <span className="text-[11px] font-semibold text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1.5">
                                <AlertTriangleIcon size={12} />
                                Written justification is mandatory when fees are overridden.
                            </span>
                        )}
                    </div>
                )}

                {/* Policy Overrides */}
                <div className="space-y-4 pt-3 border-t border-[var(--border-subtlest)]">
                    <span className="text-[11px] font-black uppercase tracking-widest text-[var(--text-subtlest)] block">Extension Policy Overrides</span>
                    <div className="pt-1">
                        <Toggle
                            label="Carry forward this fee structure to extended (child) deal."
                            checked={carryForwardFees}
                            onChange={(e) => setCarryForwardFees(e.target.checked)}
                        />
                    </div>

                    {!carryForwardFees && renderChildFeeStructureOverrides()}

                    <div className="pt-2 border-t border-[var(--border-subtlest)]">
                        <Toggle
                            label="Allow Online Extension"
                            description="Customer can perform future extensions themselves via portal"
                            checked={allowOnlineExtension}
                            onChange={(e) => setAllowOnlineExtension(e.target.checked)}
                        />
                    </div>
                </div>
            </div>
        );
    };

    const renderStep5 = () => {
        const dueToday = finalParentFees + (adjustmentMode === 'payback' ? adjustmentAmountNum : adjustmentMode === 'payout' ? -adjustmentAmountNum : 0);
        const isCardOrCash = ['Cash', 'Debit/Credit Card'].includes(paymentType);

        return (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <p className="text-[13px] text-[var(--text-subtle)] leading-relaxed">
                    Select payment details and verify the final transaction sums before executing.
                </p>

                <div className="grid grid-cols-2 gap-4">
                    <Dropdown
                        label="Payment Type"
                        value={paymentType}
                        onChange={(val) => setPaymentType(val)}
                        options={[
                            { label: 'Cash', value: 'Cash' },
                            { label: 'Debit/Credit Card', value: 'Debit/Credit Card' },
                            { label: 'Bank Transfer', value: 'Bank Transfer' },
                            { label: 'PayPal', value: 'PayPal' },
                        ]}
                    />

                    {isCardOrCash && (
                        <Dropdown
                            label="Cash Book"
                            value={cashBookName}
                            onChange={(val) => setCashBookName(val)}
                            options={cashBookOptions}
                        />
                    )}
                </div>

                <div className="bg-[var(--background-secondary)]/40 rounded-xl border border-[var(--border-subtlest)] overflow-hidden text-xs">
                    <div className="flex justify-between items-center px-4 py-3 border-b border-[var(--border-subtlest)]">
                        <span className="text-[var(--text-subtle)] font-medium">New Contract Due Date</span>
                        <span className="font-bold text-[var(--text-primary)]">{fmtDate(newDueDate)}</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-3 border-b border-[var(--border-subtlest)]">
                        <span className="text-[var(--text-subtle)] font-medium">New Total Loan Principal</span>
                        <span className="font-bold text-[var(--text-primary)]">€ {fmtEur(newTotalPayout)}</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-3 border-b border-[var(--border-subtlest)]">
                        <span className="text-[var(--text-subtle)] font-medium">Parent Fees Charged</span>
                        <span className="font-bold text-[var(--text-primary)]">€ {fmtEur(finalParentFees)}</span>
                    </div>
                    {adjustmentMode !== 'none' && (
                        <div className="flex justify-between items-center px-4 py-3 border-b border-[var(--border-subtlest)]">
                            <span className="text-[var(--text-subtle)] font-medium">
                                {adjustmentMode === 'payback' ? 'Partial Payback' : 'Additional Payout'}
                            </span>
                            <span className={`font-bold ${adjustmentMode === 'payback' ? 'text-[var(--text-success)]' : 'text-blue-600'}`}>
                                {adjustmentMode === 'payback' ? '-' : '+'} € {fmtEur(adjustmentAmountNum)}
                            </span>
                        </div>
                    )}
                    <div className="flex justify-between items-center px-4 py-3">
                        <span className="text-[var(--text-subtle)] font-semibold">Next Contract Fee Structure</span>
                        <span className={`text-[12px] px-2.5 py-0.5 rounded-full font-bold ${
                            carryForwardFees
                                ? 'bg-green-50 dark:bg-green-950/20 text-[var(--text-success)] border border-green-200'
                                : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-200'
                        }`}>
                            {carryForwardFees ? 'Same as Parent' : 'Custom Override'}
                        </span>
                    </div>
                </div>

                {/* Financial Net Sum Card */}
                {dueToday > 0 ? (
                    <div className="p-4 border border-red-200 bg-red-50/50 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in duration-200">
                        <div>
                            <p className="text-[10px] font-extrabold uppercase tracking-widest text-red-700">Customer Pays Today</p>
                            <p className="text-[11px] text-red-600 mt-0.5">Parent fees + principal payback</p>
                        </div>
                        <span className="text-[20px] font-extrabold text-[var(--text-error)]">€ {fmtEur(dueToday)}</span>
                    </div>
                ) : dueToday < 0 ? (
                    <div className="p-4 border border-green-200 bg-green-50/50 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in duration-200">
                        <div>
                            <p className="text-[10px] font-extrabold uppercase tracking-widest text-green-700">Customer Receives Today</p>
                            <p className="text-[11px] text-green-600 mt-0.5">Net additional payout amount</p>
                        </div>
                        <span className="text-[20px] font-extrabold text-[var(--text-success)]">€ {fmtEur(Math.abs(dueToday))}</span>
                    </div>
                ) : (
                    <div className="p-4 border border-gray-200 bg-gray-50 rounded-xl text-center text-xs font-semibold text-gray-500 shadow-sm animate-in fade-in duration-200">
                        No payment due today
                    </div>
                )}
            </div>
        );
    };

    const isLastStep = step === TOTAL_STEPS;

    return (
        <div
            className="fixed inset-0 z-[250] flex items-center justify-center bg-[#131518]/60 backdrop-blur-sm animate-in fade-in duration-200 p-0 md:p-4"
            onClick={(e) => { e.stopPropagation(); }}
        >
            <div
                className="w-full md:max-w-[1200px] h-full md:h-[95vh] md:max-h-[95vh] flex flex-col bg-[var(--background-primary)] overflow-hidden rounded-none md:rounded-[24px] shadow-none md:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom-8 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Desktop Header */}
                <div className="hidden md:flex px-6 py-5 border-b border-[var(--border-subtlest)] items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[var(--background-brand-primary)] flex items-center justify-center">
                            <ArrowUpRightIcon size={16} strokeWidth={2} className="text-[var(--text-brand)]" />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-extrabold text-[var(--text-primary)] m-0 leading-tight">Extend Deal</h2>
                            <p className="text-[11px] font-semibold text-[var(--text-subtle)] m-0 mt-0.5">
                                Deal #{dealData.id} · {dealData.firstName} {dealData.lastName}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--background-secondary)] text-[var(--text-subtle)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                    >
                        <XIcon size={16} />
                    </button>
                </div>

                {/* Mobile Header */}
                <div className="md:hidden border-b border-[var(--border-subtlest)] shrink-0 bg-[var(--background-primary)] px-4 py-3 flex items-center justify-between z-40">
                    <div className="w-10 h-10 shrink-0" />
                    <div className="flex flex-col items-center justify-center select-none max-w-[60%]">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--text-placeholder)] truncate w-full text-center">
                            {dealData.firstName} {dealData.lastName}
                        </span>
                        <span className="text-sm font-bold text-[var(--text-primary)] truncate mt-0.5">
                            EXTEND DEAL #{dealData.id}
                        </span>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[var(--background-hover)] text-[var(--text-subtlest)]"
                    >
                        <XIcon size={20} />
                    </button>
                </div>

                {/* Slick clickable adjacent tab-stepper */}
                <div className="flex border-b border-[var(--border-subtlest)] bg-[var(--background-secondary)]/20 shrink-0 select-none">
                    {[
                        { num: 1, name: 'Summary', short: 'Summ' },
                        { num: 2, name: 'Duration', short: 'Dur' },
                        { num: 3, name: 'Adjustment', short: 'Adj' },
                        { num: 4, name: 'Fees', short: 'Fees' },
                        { num: 5, name: 'Payment', short: 'Pay' }
                    ].map((t) => (
                        <button
                            key={t.num}
                            type="button"
                            onClick={() => scrollToSection(t.num)}
                            className={`flex-1 py-3.5 text-center border-b-[3px] font-bold text-[11px] md:text-[13px] transition-all cursor-pointer bg-transparent outline-none flex items-center justify-center gap-1.5 ${
                                step === t.num
                                    ? 'border-[var(--brand-500)] text-[var(--text-brand)] bg-[var(--background-primary)]'
                                    : 'border-transparent text-[var(--text-subtlest)] hover:text-[var(--text-primary)] hover:bg-[var(--background-hover)]'
                            }`}
                        >
                            <span className={`w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center text-[9px] md:text-[10px] font-black ${
                                step === t.num
                                    ? 'bg-[var(--brand-500)] text-white'
                                    : step > t.num
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-[var(--border-subtlest)] text-[var(--text-subtlest)]'
                            }`}>
                                {step > t.num ? (
                                    <svg width="7" height="5" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                ) : t.num}
                            </span>
                            <span className="block sm:hidden">{t.short}</span>
                            <span className="hidden sm:block">{t.name}</span>
                        </button>
                    ))}
                </div>

                {/* Scrollable content container */}
                <div 
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto px-5 pb-5 pt-0 slick-scrollbar scroll-smooth bg-[#F5F6F8]"
                    style={{ height: '100%', scrollBehavior: 'smooth' }}
                >
                    <div className="space-y-4 pb-12 pt-5">
                        {[
                            { num: 1, label: 'Current Deal Summary', content: renderStep1() },
                            { num: 2, label: 'Duration & Base Fees', content: renderStep2() },
                            { num: 3, label: 'Loan Adjustment', content: renderStep3() },
                            { num: 4, label: 'Fee & Policy Overrides', content: renderStep4() },
                            { num: 5, label: 'Payment & Final Review', content: renderStep5() },
                        ].map(({ num, label, content }) => {
                            const isActive = step === num;
                            const isCompleted = step > num;
                            return (
                                <div
                                    key={num}
                                    id={`extend-step-${num}`}
                                    className={`scroll-mt-20 space-y-4 pt-4 transition-opacity duration-200 ${isCompleted ? 'opacity-75' : 'opacity-100'}`}
                                >
                                    {/* Section Chapter Heading — sticky within section */}
                                    <div className="sticky top-0 z-10 flex items-center gap-4 -mx-5 px-6 py-3 bg-[#F5F6F8] border-b border-[var(--border-subtlest)]">
                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-black shrink-0 ${
                                            isCompleted
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-[var(--brand-500)] text-white'
                                        }`}>
                                            {isCompleted ? (
                                                <svg width="10" height="8" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                            ) : num}
                                        </span>
                                        <div>
                                            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--text-placeholder)] m-0 mb-0.5">
                                                Step {num} of 5
                                            </p>
                                            <h2 className={`text-xl font-bold m-0 ${
                                                isActive ? 'text-[#131518]' : 'text-[var(--text-subtle)]'
                                            }`}>{label}</h2>
                                        </div>
                                        {isCompleted && (
                                            <span className="ml-auto text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Done</span>
                                        )}
                                    </div>

                                    <div className="bg-[var(--background-primary)] rounded-2xl border border-[var(--border-subtlest)] shadow-sm overflow-hidden p-5">
                                        {content}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 md:pb-4 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t border-[var(--border-subtlest)] bg-[var(--background-secondary)]/40 flex items-center justify-between shrink-0">
                    {step > 1 ? (
                        <Button variant="secondary" onClick={goBack} disabled={isSubmitting} className="cursor-pointer">Back</Button>
                    ) : (
                        <Button variant="secondary" onClick={onClose} disabled={isSubmitting} className="cursor-pointer">Cancel</Button>
                    )}

                    {isLastStep ? (
                        <Button
                            variant="primary"
                            onClick={handleConfirm}
                            disabled={isSubmitting}
                            isLoading={isSubmitting}
                            className="cursor-pointer font-bold"
                        >
                            {isSubmitting ? 'Confirming...' : 'Confirm Extension'}
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            onClick={() => {
                                if (step === 4) {
                                    if (isEditingDeal) setIsEditingDeal(false);
                                    if (editingItemIds.length > 0) setEditingItemIds([]);
                                }
                                goNext();
                            }}
                            disabled={!canContinue}
                            className="cursor-pointer font-bold"
                        >
                            {step === 4 && (isEditingDeal || editingItemIds.length > 0) ? 'Save & Continue' : 'Continue'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
