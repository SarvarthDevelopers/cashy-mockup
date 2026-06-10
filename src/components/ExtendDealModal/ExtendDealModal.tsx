import React, { useState, useEffect } from 'react';
import { Button, Input, Dropdown, Toggle } from '../';
import type { DealData } from '../../data/mockData';

// Re-importing Lucide icons explicitly to avoid index mismatches
import { X as XIcon, RefreshCw as RefreshCwIcon, Calendar as CalendarIcon } from 'lucide-react';

export interface ExtendDealModalProps {
    isOpen: boolean;
    onClose: () => void;
    dealData?: DealData;
    onUpdateDeal?: (deal: DealData) => void;
}

// Step labels matching the spec exactly
const STEP_LABELS = [
    'Deal Summary',
    'Duration & Base Fees',
    'Loan Adjustment',
    'Fee & Policy Overrides',
    'Payment & Final Review',
];

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
    // Remove currency symbol, then handle German decimal notation
    const cleaned = str.replace(/[€\s]/g, '').replace(/\./g, '').replace(',', '.');
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
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [extensionDays, setExtensionDays] = useState('30');
    
    // Step 3: Loan Adjustment states
    const [adjustmentMode, setAdjustmentMode] = useState<'none' | 'payback' | 'payout'>('none');
    const [adjustmentAmountInput, setAdjustmentAmountInput] = useState('');

    // Step 4: Overrides states
    const [customParentFees, setCustomParentFees] = useState('');
    const [childFeeRateOverride, setChildFeeRateOverride] = useState('4.0');
    const [allowOnlineExtension, setAllowOnlineExtension] = useState(true);

    // Step 5: Payment states
    const [paymentType, setPaymentType] = useState('Cash');
    const [cashBookName, setCashBookName] = useState(() => {
        return dealData?.countryCode === 'DE' ? 'Munich Main Cash' : 'Vienna Main Cash';
    });

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                setStep(1);
                setExtensionDays('30');
                setAdjustmentMode('none');
                setAdjustmentAmountInput('');
                setCustomParentFees('');
                setChildFeeRateOverride('4.0');
                setAllowOnlineExtension(true);
                setPaymentType('Cash');
                setCashBookName(dealData?.countryCode === 'DE' ? 'Munich Main Cash' : 'Vienna Main Cash');
                setIsSubmitting(false);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [isOpen, dealData?.id, dealData?.countryCode]);

    if (!isOpen || !dealData) return null;

    // --- Calculations ---
    const currentPayout = parseEurAmount(dealData.amount || '0');
    const mockMarketValue = currentPayout * 2.2;
    const maxAllowedPayout = mockMarketValue * 0.60;
    const additionalPossible = Math.max(0, maxAllowedPayout - currentPayout);
    const currentDuration = parseInt(dealData.wizardData?.dealDuration || '0', 10);

    // Base parent fees calculation based on elapsed days (defaults to currentDuration, else 30)
    const elapsedDays = currentDuration || 30;
    const calculatedBaseFees = Math.round(currentPayout * 0.04 * (elapsedDays / 30));

    const origDueDate = parseDueDate(dealData.dueDate);
    const newDueDate = new Date(origDueDate);
    newDueDate.setDate(newDueDate.getDate() + parseInt(extensionDays, 10));

    const adjustmentAmountNum = parseFloat(adjustmentAmountInput) || 0;
    const adjustmentAmount = adjustmentMode === 'payback' ? adjustmentAmountNum : adjustmentMode === 'payout' ? -adjustmentAmountNum : 0;
    const newTotalPayout = currentPayout - adjustmentAmount; // payback reduces layout payout, payout increases it

    const finalParentFees = customParentFees !== '' ? (parseFloat(customParentFees) || 0) : calculatedBaseFees;

    const TOTAL_STEPS = 5;

    const goNext = () => {
        setStep(s => s + 1);
    };

    const goBack = () => {
        setStep(s => s - 1);
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
                    childFeeRate: parseFloat(childFeeRateOverride),
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
            return finalParentFees >= 0;
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

    const renderContent = () => {
        switch (step) {
            // ── Step 1: Current Deal Summary ──────────────────────────────────
            case 1:
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

            // ── Step 2: Duration & Base Fees ────────────────────────────────────
            case 2:
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

            // ── Step 3: Loan Adjustment ─────────────────────────────
            case 3:
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

            // ── Step 4: Fee & Policy Overrides ─────────────────────────────
            case 4:
                return (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                        <p className="text-[13px] text-[var(--text-subtle)] leading-relaxed">
                            Customize transaction fees and extension policy overrides for this rollover contract.
                        </p>
                        
                        <Input
                            label="Parent Fees Due Today (€)"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder={calculatedBaseFees.toString()}
                            value={customParentFees}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomParentFees(e.target.value)}
                            error={customParentFees !== '' && parseFloat(customParentFees) < 0}
                            errorMessage="Fees must be a positive number or €0"
                        />
                        <p className="text-[11px] text-[var(--text-subtlest)] -mt-3.5">
                            Default is € {calculatedBaseFees}. Set to €0 to completely waive parent fees.
                        </p>

                        <Dropdown
                            label="Next Contract Child Fee Rate"
                            value={childFeeRateOverride}
                            onChange={(val) => setChildFeeRateOverride(val)}
                            options={[
                                { label: 'Standard (4% / month)', value: '4.0' },
                                { label: 'Override to 3%', value: '3.0' },
                                { label: 'Override to 2%', value: '2.0' },
                                { label: 'Override to 0%', value: '0.0' },
                            ]}
                        />

                        <div className="pt-2 border-t border-[var(--border-subtlest)]">
                            <Toggle
                                label="Allow Online Extension"
                                description="Customer can perform future extensions themselves via portal"
                                checked={allowOnlineExtension}
                                onChange={(e) => setAllowOnlineExtension(e.target.checked)}
                            />
                        </div>
                    </div>
                );

            // ── Step 5: Payment & Final Review ──────────────────────────────────────
            case 5: {
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
                                        {adjustmentMode === 'payback' ? 'Principal Payback' : 'Principal Payout'}
                                    </span>
                                    <span className={`font-bold ${adjustmentMode === 'payback' ? 'text-[var(--text-success)]' : 'text-blue-600'}`}>
                                        {adjustmentMode === 'payback' ? '-' : '+'} € {fmtEur(adjustmentAmountNum)}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between items-center px-4 py-3">
                                <span className="text-[var(--text-subtle)] font-semibold">Next Contract Fee Rate</span>
                                <span className="font-bold text-[var(--text-primary)]">{childFeeRateOverride}%</span>
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
            }

            default:
                return null;
        }
    };

    const isLastStep = step === TOTAL_STEPS;

    return (
        <div
            className="fixed inset-0 z-[250] flex items-center justify-center bg-[#131518]/60 backdrop-blur-sm animate-in fade-in duration-200 p-0 md:p-4"
            onClick={(e) => { e.stopPropagation(); }}
        >
            <div
                className="w-full md:max-w-[560px] h-full md:h-auto md:max-h-[90vh] flex flex-col bg-[var(--background-primary)] overflow-hidden rounded-none md:rounded-[24px] shadow-none md:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom-8 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Desktop Header */}
                <div className="hidden md:flex px-6 py-5 border-b border-[var(--border-subtlest)] items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[var(--background-brand-primary)] flex items-center justify-center">
                            <RefreshCwIcon size={16} strokeWidth={2} className="text-[var(--text-brand)]" />
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

                {/* Step indicator */}
                <div className="px-6 pt-4 pb-2 shrink-0">
                    <div className="flex items-center gap-2 mb-3">
                        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                            <div
                                key={i}
                                className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                                    i < step ? 'bg-[var(--background-brand-solid)]' : 'bg-[var(--background-secondary)]'
                                }`}
                            />
                        ))}
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-subtlest)]">
                        Step {step} of {TOTAL_STEPS} — {STEP_LABELS[step - 1]}
                    </p>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto px-6 py-4 slick-scrollbar">
                    {renderContent()}
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
                        <Button variant="primary" onClick={goNext} disabled={!canContinue} className="cursor-pointer">
                            Continue
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
