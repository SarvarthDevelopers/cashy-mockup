import React, { useState, useEffect, useRef } from 'react';
import { Button, Dropdown, Toggle } from '../';
import type { DealData } from '../../data/mockData';
import { useToast } from '../Toast/useToast';
import { 
  X as XIcon, 
  RefreshCw as RefreshCwIcon, 
  Check as CheckIcon, 
  Download as DownloadIcon, 
  AlertTriangle as AlertTriangleIcon,
  Trash2 as TrashIcon,
  Plus as PlusIcon
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

export interface PaybackDealModalProps {
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

export const PaybackDealModal: React.FC<PaybackDealModalProps> = ({
    isOpen,
    onClose,
    dealData,
    onUpdateDeal
}) => {
    const { showToast } = useToast();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Step variables
    const elapsedDays = 45; // default simulated elapsed days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - elapsedDays);

    // Dynamic initial fee components calculation
    const payoutPrincipal = dealData ? parseEurAmount(dealData.amount || '0') : 0;
    const calculatedBaseFees = Math.ceil(elapsedDays / 30) * (payoutPrincipal * 0.04);

    // Step 2: Override states & Fee Components
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
    const [feeOverrideReason, setFeeOverrideReason] = useState('');
    const [isEditingDeal, setIsEditingDeal] = useState(false);
    const [selectModeIds, setSelectModeIds] = useState<Set<string>>(new Set());
    const [editingItemIds, setEditingItemIds] = useState<string[]>([]);

    // Storage and checkout states (moved to Step 2)
    const [removeItemsFromStorage, setRemoveItemsFromStorage] = useState(true);

    // Step 3: Payment states
    const [paymentType, setPaymentType] = useState('Cash');
    const [cashBookName, setCashBookName] = useState(() => {
        return dealData?.countryCode === 'DE' ? 'Munich Main Cash' : 'Vienna Main Cash';
    });

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const isAutoScrollingRef = useRef(false);

    const scrollToSection = (targetStep: number) => {
        const container = scrollContainerRef.current;
        if (!container) return;
        
        const element = container.querySelector(`#payback-step-${targetStep}`);
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
        const stepIds = [1, 2, 3];
        let active = step;
        
        for (const s of stepIds) {
            const el = container.querySelector(`#payback-step-${s}`);
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
        if (isOpen && dealData) {
            const timer = setTimeout(() => {
                const payoutPrincipal = parseEurAmount(dealData.amount || '0');
                const calculatedBaseFees = Math.ceil(elapsedDays / 30) * (payoutPrincipal * 0.04);
                
                const components: FeeComponent[] = [
                    { id: 'deal-1', level: 'deal', type: 'Interest', amount: calculatedBaseFees * 0.5, taxRate: 0, isDefault: true },
                    { id: 'deal-2', level: 'deal', type: 'Staggered fee', amount: calculatedBaseFees * 0.3, taxRate: 20, isDefault: true }
                ];
                dealData.items.forEach((item, idx) => {
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

                setStep(1);
                if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTop = 0;
                }
                setIsSubmitting(false);
                setFeeOverrideReason('');
                setIsEditingDeal(false);
                setEditingItemIds([]);
                setRemoveItemsFromStorage(true);
                setPaymentType('Cash');
                setCashBookName(dealData?.countryCode === 'DE' ? 'Munich Main Cash' : 'Vienna Main Cash');
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [isOpen, dealData?.id, dealData?.countryCode, dealData?.items, calculatedBaseFees, dealData]);

    if (!isOpen || !dealData) return null;

    // --- Calculations ---
    const finalFees = feeComponents.reduce((sum, comp) => sum + (comp.amount || 0), 0);
    const defaultFeesBaseline = (calculatedBaseFees * 0.8) + (dealData.items.length * 1.00);
    const isFeesOverridden = Math.abs(finalFees - defaultFeesBaseline) > 0.01;
    const totalCollected = payoutPrincipal + finalFees;



    const goNext = () => {
        scrollToSection(step + 1);
    };

    const goBack = () => {
        scrollToSection(step - 1);
    };

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

    const handleDeleteComponent = (id: string) => {
        setFeeComponents(feeComponents.filter(comp => comp.id !== id));
    };

    const enterSelectMode = (id: string) => setSelectModeIds(prev => new Set([...prev, id]));
    const exitSelectMode = (id: string) => setSelectModeIds(prev => { const s = new Set(prev); s.delete(id); return s; });

    const handleConfirm = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            // Write to mock ledger
            try {
                const savedLedger = localStorage.getItem('cashy_ledger_entries');
                const ledgerEntries = savedLedger ? JSON.parse(savedLedger) : [];
                const currentBalance = ledgerEntries.length > 0 ? ledgerEntries[0].balance : 103655.13;
                const newBalance = currentBalance + totalCollected;

                const paymentTypeMap: Record<string, string> = {
                    'Cash': 'CASH',
                    'Debit/Credit Card': 'CARD',
                    'Bank Transfer': 'BANK',
                    'PayPal': 'PAYPAL'
                };

                const newEntry = {
                    id: String(Math.floor(Math.random() * 900000) + 100000),
                    date: new Date().toISOString().split('T')[0],
                    customerId: dealData.id,
                    paymentReference: 'Payback',
                    note: `Items ${removeItemsFromStorage ? 'removed' : 'retained'} - ${dealData.items.join(', ')} (Fees: ${feeComponents.map(c => `${c.level === 'item' ? `[Item: ${c.itemId}] ` : ''}${c.type === 'Other' ? (c.customName || 'Other') : c.type}: €${fmtEur(c.amount)}`).join(', ')})`,
                    inflow: totalCollected,
                    outflow: 0,
                    feesAndInterest: finalFees,
                    balance: newBalance,
                    shop: dealData.countryCode === 'DE' ? 'berlin' : 'vienna',
                    type: paymentTypeMap[paymentType] || 'BANK',
                    createdBy: 'Stefan'
                };

                localStorage.setItem('cashy_ledger_entries', JSON.stringify([newEntry, ...ledgerEntries]));
                window.dispatchEvent(new CustomEvent('cashy_ledger_updated'));
            } catch (err) {
                console.error('Failed to sync to cashbook:', err);
            }

            setIsSubmitting(false);
            setStep(4); // Go to success step
        }, 1500);
    };

    const handleFinish = () => {
        if (onUpdateDeal) {
            const meta = JSON.stringify({
                closedAt: new Date().toISOString(),
                elapsedDays,
                adjustedFees: finalFees,
                totalCollected,
                paymentType,
                cashBookName: ['Cash', 'Debit/Credit Card'].includes(paymentType) ? cashBookName : undefined,
                itemsRemovedFromStorage: removeItemsFromStorage,
                feeBreakdown: feeComponents.map(c => ({
                    level: c.level,
                    itemId: c.itemId,
                    type: c.type,
                    name: c.type === 'Other' ? c.customName : c.type,
                    amount: c.amount,
                    taxRate: c.taxRate
                }))
            });

            onUpdateDeal({
                ...dealData,
                specialNote: `PAYBACK_META:${meta}`,
            });
        }
        if (dealData) {
            showToast(`Payback Complete for Deal #${dealData.id}`, 'success');
        }
        onClose();
    };

    const downloadReceipt = () => {
        const dealFees = feeComponents.filter(c => c.level === 'deal');
        const itemFees = feeComponents.filter(c => c.level === 'item');

        const text = `
=========================================
          CASHY Redemptions Receipt
=========================================
Deal Reference: #${dealData.id}
Client: ${dealData.firstName} ${dealData.lastName}
Date of Redemption: ${new Date().toLocaleDateString('de-DE')}

Financial Summary:
-----------------------------------------
Payout Principal:      EUR ${fmtEur(payoutPrincipal)}

Deal Level Fees:
${dealFees.map(comp => `  - ${(comp.type === 'Other' ? (comp.customName || 'Other Fee') : comp.type).padEnd(20)} EUR ${fmtEur(comp.amount).padStart(8)} (VAT: ${comp.taxRate}%)`).join('\n')}

Item Level Fees:
${itemFees.map(comp => `  - [${comp.itemId}] ${(comp.type === 'Other' ? (comp.customName || 'Other Fee') : comp.type).padEnd(20)} EUR ${fmtEur(comp.amount).padStart(8)} (VAT: ${comp.taxRate}%)`).join('\n')}
-----------------------------------------
Total Amount Received: EUR ${fmtEur(totalCollected)}

Payment Method: ${paymentType} ${['Cash', 'Debit/Credit Card'].includes(paymentType) ? `(${cashBookName})` : ''}
Vault Checkout: ${removeItemsFromStorage ? 'Retrieved (CLOSED)' : 'Vault Retention (CLOSED)'}

Thank you for choosing CASHY.
=========================================
`;
        const blob = new Blob([text], { type: 'application/pdf;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `CASHY_Receipt_${dealData.id}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const isNotesRequired = isFeesOverridden && feeOverrideReason.trim() === '';
    const canContinue = (() => {
        if (step >= 2) {
            if (isNotesRequired) return false;
            if (totalCollected < 0) return false;
            if (feeComponents.some(comp => isNaN(comp.amount))) return false;
        }
        return true;
    })();




    const isCardOrCash = ['Cash', 'Debit/Credit Card'].includes(paymentType);

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
            <div className="space-y-5">
                <p className="text-[13px] text-[var(--text-subtle)] leading-relaxed">
                    Confirm the calculated pawn duration and base accumulated fees.
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[var(--background-secondary)]/40 p-4 rounded-xl border border-[var(--border-subtlest)] flex flex-col justify-between">
                        <span className="text-[11px] font-semibold text-[var(--text-subtle)] uppercase tracking-wider">Start Date</span>
                        <span className="text-[15px] font-bold text-[var(--text-primary)] mt-1.5">{fmtDate(startDate)}</span>
                    </div>
                    <div className="bg-[var(--background-secondary)]/40 p-4 rounded-xl border border-[var(--border-subtlest)] flex flex-col justify-between">
                        <span className="text-[11px] font-semibold text-[var(--text-subtle)] uppercase tracking-wider">Elapsed Days</span>
                        <span className="text-[15px] font-bold text-[var(--text-primary)] mt-1.5">{elapsedDays} Days</span>
                    </div>
                </div>

                <div className="bg-[var(--background-secondary)]/40 rounded-xl border border-[var(--border-subtlest)] overflow-hidden">
                    {[
                        { label: 'Payout Principal', value: `€ ${fmtEur(payoutPrincipal)}` },
                        { label: 'Accumulated Fees (4% per 30-day block)', value: `€ ${fmtEur(calculatedBaseFees)}` },
                        { label: 'Current Due Date', value: dealData.dueDate || '—' },
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
            <div className="space-y-5">
                <div className="flex justify-between items-start border-b border-[var(--border-subtlest)] pb-4 gap-4">
                    <div className="pr-6 max-w-[75%]">
                        <h3 className="text-[13px] font-bold text-[var(--text-primary)] mb-1">Maturity & Fee Adjustments</h3>
                        <p className="text-[11px] text-[var(--text-subtle)] leading-relaxed">
                            Review and edit fees. Add other fees if needed.
                        </p>
                    </div>
                    <div className="text-right shrink-0 mt-0.5">
                        <span className="text-[9px] uppercase font-black tracking-widest text-[var(--text-subtlest)] block mb-0.5">Total Fees</span>
                        <span className="text-[16px] font-extrabold text-[var(--text-primary)]">€ {fmtEur(finalFees)}</span>
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
                                                            title="Delete component"
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
                                                                                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7.5 2L4 6l3.5 4"/></svg>
                                                                                </button>
                                                                                <input
                                                                                    type="text"
                                                                                    autoFocus
                                                                                    className="flex-1 text-[12px] px-1.5 py-1 bg-[var(--background-primary)] border border-[var(--border-brand)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-500)] text-[var(--text-primary)] font-normal"
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

                {/* Physical Storage Retrieval Options */}
                <div className="bg-[var(--background-secondary)]/40 p-4 rounded-xl border border-[var(--border-subtlest)] space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[13px] font-bold text-[var(--text-primary)]">Remove items from storage today?</span>
                            <span className={`text-[11px] font-medium ${removeItemsFromStorage ? 'text-blue-600' : 'text-amber-600'}`}>
                                {removeItemsFromStorage ? 'Items will be checked out from the vault today.' : 'Items will remain in storage.'}
                            </span>
                        </div>
                        <Toggle
                            checked={removeItemsFromStorage}
                            onChange={(e) => setRemoveItemsFromStorage(e.target.checked)}
                        />
                    </div>
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
            </div>
        );
    };

    const renderStep3 = () => {
        return (
            <div className="space-y-5">
                <p className="text-[13px] text-[var(--text-subtle)] leading-relaxed">
                    Select the incoming payment method and register destination.
                </p>

                <div className="space-y-4">
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
                        <span className="text-[var(--text-subtle)] font-medium">Payout Principal</span>
                        <span className="font-bold text-[var(--text-primary)]">€ {fmtEur(payoutPrincipal)}</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-3 border-b border-[var(--border-subtlest)]">
                        <span className="text-[var(--text-subtle)] font-medium">Adjusted Fees</span>
                        <span className="font-bold text-[var(--text-primary)]">€ {fmtEur(finalFees)}</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-3">
                        <span className="text-[var(--text-subtle)] font-medium">Checkout Status</span>
                        <span className="font-bold text-[var(--text-primary)]">{removeItemsFromStorage ? 'Retrieve from vault' : 'Retain in vault'}</span>
                    </div>
                </div>

                {/* Customer inflow */}
                <div className="p-4 border border-green-200 bg-green-50/50 rounded-xl flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-green-700">Customer Pays (Inflow)</p>
                        <p className="text-[11px] text-green-600 mt-0.5">Payment type: {paymentType}</p>
                    </div>
                    <span className="text-[20px] font-extrabold text-[var(--text-success)]">€ {fmtEur(totalCollected)}</span>
                </div>
            </div>
        );
    };

    const renderSuccessStep = () => {
        return (
            <div className="text-center py-6 space-y-6 animate-in fade-in zoom-in-95 duration-500">
                {/* Beautiful Checkmark Animation */}
                <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-green-50 border-4 border-green-500 flex items-center justify-center animate-bounce shadow-md">
                        <CheckIcon size={32} className="text-green-600 stroke-[3]" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-lg font-extrabold text-[var(--text-primary)]">Payback Confirmed!</h3>
                    <p className="text-[13px] text-[var(--text-subtle)] max-w-sm mx-auto leading-relaxed">
                        Deal status has been updated. The transaction of <span className="font-bold text-[var(--text-success)]">€ {fmtEur(totalCollected)}</span> was synced to the Cashbook Ledger.
                    </p>
                </div>

                <div className="bg-[var(--background-secondary)]/40 p-4 rounded-xl border border-[var(--border-subtlest)] text-xs text-left max-w-sm mx-auto space-y-2">
                    <div className="flex justify-between"><span className="text-[var(--text-subtle)]">Deal ID:</span><span className="font-bold">#{dealData.id}</span></div>
                    <div className="flex justify-between"><span className="text-[var(--text-subtle)]">Customer:</span><span className="font-bold">{dealData.firstName} {dealData.lastName}</span></div>
                    <div className="flex justify-between"><span className="text-[var(--text-subtle)]">Amount Paid:</span><span className="font-bold text-[var(--text-success)]">€ {fmtEur(totalCollected)}</span></div>
                    <div className="flex justify-between"><span className="text-[var(--text-subtle)]">Inventory checkout:</span><span className="font-bold">{removeItemsFromStorage ? 'Retrieved today' : 'Retained in vault'}</span></div>
                </div>

                <div className="flex justify-center pt-2">
                    <Button 
                        variant="secondary" 
                        size="medium"
                        onClick={downloadReceipt} 
                        className="flex items-center gap-2 font-bold cursor-pointer"
                    >
                        <DownloadIcon size={15} />
                        Print / Download Receipt (PDF)
                    </Button>
                </div>
            </div>
        );
    };

    const isLastStepBeforeSuccess = step === 3;
    const isSuccessStep = step === 4;

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
                            <RefreshCwIcon size={16} strokeWidth={2} className="text-[var(--text-brand)]" />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-extrabold text-[var(--text-primary)] m-0 leading-tight">Payback Deal (Redemption)</h2>
                            <p className="text-[11px] font-semibold text-[var(--text-subtle)] m-0 mt-0.5">
                                Deal #{dealData.id} · {dealData.firstName} {dealData.lastName}
                            </p>
                        </div>
                    </div>
                    {!isSuccessStep && (
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--background-secondary)] text-[var(--text-subtle)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                        >
                            <XIcon size={16} />
                        </button>
                    )}
                </div>

                {/* Mobile Header */}
                <div className="md:hidden border-b border-[var(--border-subtlest)] shrink-0 bg-[var(--background-primary)] px-4 py-3 flex items-center justify-between z-40">
                    <div className="w-10 h-10 shrink-0" />
                    <div className="flex flex-col items-center justify-center select-none max-w-[60%]">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--text-placeholder)] truncate w-full text-center">
                            {dealData.firstName} {dealData.lastName}
                        </span>
                        <span className="text-sm font-bold text-[var(--text-primary)] truncate mt-0.5">
                            PAYBACK DEAL #{dealData.id}
                        </span>
                    </div>
                    {!isSuccessStep ? (
                        <button 
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[var(--background-hover)] text-[var(--text-subtlest)]"
                        >
                            <XIcon size={20} />
                        </button>
                    ) : (
                        <div className="w-10 h-10 shrink-0" />
                    )}
                </div>

                {/* Slick clickable adjacent tab-stepper */}
                {!isSuccessStep && (
                    <div className="flex border-b border-[var(--border-subtlest)] bg-[var(--background-secondary)]/20 shrink-0 select-none">
                        {[
                            { num: 1, name: 'Summary' },
                            { num: 2, name: 'Fee Adjustments' },
                            { num: 3, name: 'Payment' }
                        ].map((t) => (
                            <button
                                key={t.num}
                                type="button"
                                onClick={() => scrollToSection(t.num)}
                                className={`flex-1 py-3.5 text-center border-b-[3px] font-bold text-[13px] transition-all cursor-pointer bg-transparent outline-none flex items-center justify-center gap-2 ${
                                    step === t.num
                                        ? 'border-[var(--brand-500)] text-[var(--text-brand)] bg-[var(--background-primary)]'
                                        : 'border-transparent text-[var(--text-subtlest)] hover:text-[var(--text-primary)] hover:bg-[var(--background-hover)]'
                                }`}
                            >
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                                    step === t.num
                                        ? 'bg-[var(--brand-500)] text-white'
                                        : step > t.num
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-[var(--border-subtlest)] text-[var(--text-subtlest)]'
                                }`}>
                                    {step > t.num ? (
                                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    ) : t.num}
                                </span>
                                {t.name}
                            </button>
                        ))}
                    </div>
                )}

                {/* Scrollable content container */}
                <div 
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto px-5 pb-5 pt-0 slick-scrollbar scroll-smooth bg-[#F5F6F8]"
                    style={{ height: '100%', scrollBehavior: 'smooth' }}
                >
                    {isSuccessStep ? (
                        renderSuccessStep()
                    ) : (
                        <div className="space-y-4 pb-12 pt-5">
                            {[
                                { num: 1, label: 'Summary & Calculations', content: renderStep1() },
                                { num: 2, label: 'Fee Adjustments', content: renderStep2() },
                                { num: 3, label: 'Payment & Inflow', content: renderStep3() },
                            ].map(({ num, label, content }) => {
                                const isActive = step === num;
                                const isCompleted = step > num;
                                return (
                                    <div
                                        key={num}
                                        id={`payback-step-${num}`}
                                        className={`scroll-mt-20 space-y-4 pt-4 transition-opacity duration-200 ${isCompleted ? 'opacity-75' : 'opacity-100'}`}
                                    >
                                        {/* Section Chapter Heading */}
                                        <div className="flex items-center gap-4 py-2">
                                            <span className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-black shrink-0 bg-[var(--brand-500)] text-white">
                                                {num}
                                            </span>
                                            <div>
                                                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--text-placeholder)] m-0 mb-0.5">
                                                    Step {num} of 3
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
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 md:pb-4 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t border-[var(--border-subtlest)] bg-[var(--background-secondary)]/40 flex items-center justify-between shrink-0">
                    {isSuccessStep ? (
                        <div className="w-full flex justify-end">
                            <Button 
                                variant="primary" 
                                onClick={handleFinish} 
                                className="cursor-pointer font-bold px-6"
                            >
                                Done
                            </Button>
                        </div>
                    ) : (
                        <>
                            {step > 1 ? (
                                <Button variant="secondary" onClick={goBack} disabled={isSubmitting} className="cursor-pointer">Back</Button>
                            ) : (
                                <Button variant="secondary" onClick={onClose} disabled={isSubmitting} className="cursor-pointer">Cancel</Button>
                            )}

                            {isLastStepBeforeSuccess ? (
                                <Button
                                    variant="primary"
                                    onClick={handleConfirm}
                                    disabled={isSubmitting}
                                    isLoading={isSubmitting}
                                    className="cursor-pointer font-bold"
                                >
                                    {isSubmitting ? 'Confirming...' : 'Confirm Payback'}
                                </Button>
                            ) : (
                                <Button
                                    variant="primary"
                                    onClick={() => {
                                        if (isEditingDeal) setIsEditingDeal(false);
                                        if (editingItemIds.length > 0) setEditingItemIds([]);
                                        goNext();
                                    }}
                                    disabled={!canContinue}
                                    className="cursor-pointer font-bold"
                                >
                                    {step === 2 && (isEditingDeal || editingItemIds.length > 0) ? 'Save & Continue' : 'Continue'}
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
