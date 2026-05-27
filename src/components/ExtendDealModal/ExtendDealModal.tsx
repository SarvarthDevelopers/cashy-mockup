import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Calendar, Info, CheckCircle2 } from 'lucide-react';
import { Button, Input, Dropdown } from '../';
import type { DealData } from '../../data/mockData';

export interface ExtendDealModalProps {
    isOpen: boolean;
    onClose: () => void;
    dealData?: DealData;
    onUpdateDeal?: (deal: DealData) => void;
}

// Step labels matching the spec exactly
const STEP_LABELS = [
    'Deal Summary',
    'Extension Duration',
    'Additional Payout',
    'Payout Amount',
    'Review & Confirm',
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
    // Steps: 1=Summary, 2=Duration, 3=Toggle, 4=Amount (skipped if no), 5=Review
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [extensionDays, setExtensionDays] = useState('30');
    const [wantsMoreMoney, setWantsMoreMoney] = useState<boolean | null>(null); // null = not yet chosen
    const [requestedAdditional, setRequestedAdditional] = useState('');

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                setStep(1);
                setExtensionDays('30');
                setWantsMoreMoney(null);
                setRequestedAdditional('');
                setIsSubmitting(false);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [isOpen, dealData?.id]);

    if (!isOpen || !dealData) return null;

    // --- Calculations ---
    const currentPayout = parseEurAmount(dealData.amount || '0');
    const mockMarketValue = currentPayout * 2.2;
    const maxAllowedPayout = mockMarketValue * 0.60;
    const additionalPossible = Math.max(0, maxAllowedPayout - currentPayout);
    const currentDuration = parseInt(dealData.wizardData?.dealDuration || '0', 10);

    const origDueDate = parseDueDate(dealData.dueDate);
    const newDueDate = new Date(origDueDate);
    newDueDate.setDate(newDueDate.getDate() + parseInt(extensionDays, 10));

    const currentFees = mockMarketValue * 0.05;
    const additionalNum = parseFloat(requestedAdditional) || 0;
    const actualAdditional = wantsMoreMoney ? Math.min(additionalNum, additionalPossible) : 0;
    const newTotalPayout = currentPayout + actualAdditional;
    const newFees = newTotalPayout * 0.05;

    // Navigation: step 3 has branching — if No, skip step 4 (amount input)
    const TOTAL_STEPS = 5;
    const progressSteps = wantsMoreMoney === false ? 4 : TOTAL_STEPS; // visual denominator

    const goNext = () => {
        if (step === 3 && wantsMoreMoney === false) {
            setStep(5); // skip step 4
        } else {
            setStep(s => s + 1);
        }
    };

    const goBack = () => {
        if (step === 5 && wantsMoreMoney === false) {
            setStep(3); // go back to toggle, not step 4
        } else {
            setStep(s => s - 1);
        }
    };

    const handleConfirm = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            if (onUpdateDeal) {
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const formattedDueDate = `${monthNames[newDueDate.getMonth()]} ${newDueDate.getDate()}`;

                // Encode metadata so DealsPage can show extension details and enable revert
                const meta = JSON.stringify({
                    originalDueDate: dealData.dueDate || '—',
                    originalPayout: currentPayout,
                    extensionDays: parseInt(extensionDays, 10),
                    additionalPayout: actualAdditional,
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


    // Step validity for "Continue" button
    const canContinue = (() => {
        if (step === 3) return wantsMoreMoney !== null;
        if (step === 4) return additionalNum > 0 && additionalNum <= additionalPossible;
        return true;
    })();

    // Visible step index for progress bar (step 4 is skipped when wantsMoreMoney=false)
    const visibleStep = step === 5 && wantsMoreMoney === false ? 4 : step;

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
                                { label: 'Est. Fees (5%)', value: `€ ${fmtEur(currentFees)}` },
                            ].map(({ label, value }, i, arr) => (
                                <div key={label} className={`flex justify-between items-center px-5 py-3.5 ${i < arr.length - 1 ? 'border-b border-[var(--border-subtlest)]' : ''}`}>
                                    <span className="text-[13px] text-[var(--text-subtle)] font-medium">{label}</span>
                                    <span className="text-[13px] font-bold text-[var(--text-primary)]">{value}</span>
                                </div>
                            ))}
                        </div>
                        {/* Items list */}
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

            // ── Step 2: Extension Duration ────────────────────────────────────
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
                            <Calendar size={20} className="text-[var(--text-brand)] shrink-0" />
                            <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--text-brand)]">New Due Date</span>
                                <p className="text-[16px] font-extrabold text-[var(--text-brand)] mt-0.5">{fmtDate(newDueDate)}</p>
                                <p className="text-[11px] text-[var(--text-brand)]/70 font-medium mt-0.5">Extended from {dealData.dueDate || '—'} by {extensionDays} days</p>
                            </div>
                        </div>
                        <div className="p-4 bg-[var(--background-secondary)]/40 border border-[var(--border-subtlest)] rounded-xl">
                            <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-subtlest)] mb-2">New Fees (Est.)</p>
                            <p className="text-[14px] font-bold text-[var(--text-primary)]">€ {fmtEur(newFees)}</p>
                            <p className="text-[11px] text-[var(--text-subtlest)] mt-0.5">Calculated on current payout amount</p>
                        </div>
                    </div>
                );

            // ── Step 3: Additional Payout Toggle ─────────────────────────────
            case 3:
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <p className="text-[13px] text-[var(--text-subtle)] leading-relaxed">
                            Does the customer want to request additional funds? This is possible if the current market value of the collateral supports a higher loan.
                        </p>
                        <div className="space-y-3">
                            {[
                                { value: false, label: 'No — Standard Extension', sub: 'Extend the due date only. No additional payout.' },
                                { value: true, label: 'Yes — Request Additional Payout', sub: `Up to €\u00a0${fmtEur(additionalPossible)} available based on current LTV.` },
                            ].map(({ value, label, sub }) => (
                                <button
                                    key={String(value)}
                                    onClick={() => setWantsMoreMoney(value)}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-150 ${
                                        wantsMoreMoney === value
                                            ? 'border-[var(--border-brand)] bg-[var(--background-brand-primary)]'
                                            : 'border-[var(--border-subtlest)] bg-[var(--background-secondary)]/30 hover:border-[var(--border-brand-subtle)]'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                            wantsMoreMoney === value ? 'border-[var(--border-brand)] bg-[var(--background-brand-solid)]' : 'border-[var(--border-subtle)]'
                                        }`}>
                                            {wantsMoreMoney === value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                        </div>
                                        <div>
                                            <p className={`text-[13px] font-bold ${wantsMoreMoney === value ? 'text-[var(--text-brand)]' : 'text-[var(--text-primary)]'}`}>{label}</p>
                                            <p className="text-[11px] text-[var(--text-subtle)] mt-0.5">{sub}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            // ── Step 4: Additional Payout Amount ─────────────────────────────
            case 4:
                return (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                        <p className="text-[13px] text-[var(--text-subtle)] leading-relaxed">
                            Enter the additional payout requested by the customer. This cannot exceed the maximum supported by the current market value.
                        </p>
                        <div className="flex justify-between items-center p-4 bg-[var(--background-secondary)] rounded-xl border border-[var(--border-subtlest)]">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-subtlest)]">Maximum Additional Payout</p>
                                <p className="text-[11px] text-[var(--text-subtle)] mt-0.5">Based on 60% LTV — already paid payout</p>
                            </div>
                            <span className="text-[18px] font-extrabold text-[var(--text-brand)]">€ {fmtEur(additionalPossible)}</span>
                        </div>
                        <Input
                            label="Requested Additional Amount (€)"
                            type="number"
                            placeholder="0.00"
                            value={requestedAdditional}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRequestedAdditional(e.target.value)}
                        />
                        {additionalNum > additionalPossible && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <Info size={14} className="text-red-600 shrink-0" />
                                <p className="text-[12px] text-red-700 font-semibold">Amount exceeds the maximum allowed. Please enter €\u00a0{fmtEur(additionalPossible)} or less.</p>
                            </div>
                        )}
                        {additionalNum > 0 && additionalNum <= additionalPossible && (
                            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <CheckCircle2 size={14} className="text-green-600 shrink-0" />
                                <p className="text-[12px] text-green-700 font-semibold">New total payout will be €\u00a0{fmtEur(newTotalPayout)}</p>
                            </div>
                        )}
                    </div>
                );

            // ── Step 5: Review & Confirm ──────────────────────────────────────
            case 5:
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <p className="text-[13px] text-[var(--text-subtle)] leading-relaxed">
                            Review the extension summary before confirming. This will update the deal record and log a timeline entry.
                        </p>
                        <div className="bg-[var(--background-secondary)]/40 rounded-xl border border-[var(--border-subtlest)] overflow-hidden">
                            {[
                                { label: 'New Due Date', value: fmtDate(newDueDate) },
                                { label: 'New Total Payout', value: `€ ${fmtEur(newTotalPayout)}` },
                                { label: 'New Est. Fees', value: `€ ${fmtEur(newFees)}` },
                                ...(actualAdditional > 0 ? [{ label: 'Additional Payout', value: `€ ${fmtEur(actualAdditional)}` }] : []),
                            ].map(({ label, value }, i, arr) => (
                                <div key={label} className={`flex justify-between items-center px-5 py-3.5 ${i < arr.length - 1 ? 'border-b border-[var(--border-subtlest)]' : ''}`}>
                                    <span className="text-[13px] text-[var(--text-subtle)] font-medium">{label}</span>
                                    <span className="text-[13px] font-bold text-[var(--text-primary)]">{value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Financial outcome cards */}
                        <div className="space-y-2.5">
                            <div className="p-4 border border-[var(--border-subtlest)] bg-[var(--background-primary)] rounded-xl flex items-center justify-between shadow-sm">
                                <div>
                                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--text-subtle)]">Customer Pays Now</p>
                                    <p className="text-[11px] text-[var(--text-subtlest)] mt-0.5">Extension fees for {extensionDays} days</p>
                                </div>
                                <span className="text-[18px] font-extrabold text-[var(--text-error)]">€ {fmtEur(currentFees)}</span>
                            </div>
                            {actualAdditional > 0 && (
                                <div className="p-4 border border-green-200 bg-green-50 rounded-xl flex items-center justify-between shadow-sm">
                                    <div>
                                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-green-700">Customer Receives Now</p>
                                        <p className="text-[11px] text-green-600 mt-0.5">Additional payout disbursed</p>
                                    </div>
                                    <span className="text-[18px] font-extrabold text-green-700">€ {fmtEur(actualAdditional)}</span>
                                </div>
                            )}
                        </div>

                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-[11px] text-amber-700 font-semibold leading-relaxed">
                                Confirming will update the deal record, shift the due date, and log a timeline entry. This action is reversible only by an Admin.
                            </p>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const isLastStep = step === 5;

    return (
        <div
            className="fixed inset-0 z-[250] flex items-center justify-center bg-[#131518]/60 backdrop-blur-sm animate-in fade-in duration-200 p-4"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
        >
            <div
                className="w-full max-w-[560px] flex flex-col bg-[var(--background-primary)] overflow-hidden rounded-[24px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom-8 duration-300 max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-[var(--border-subtlest)] flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[var(--background-brand-primary)] flex items-center justify-center">
                            <RefreshCw size={16} strokeWidth={2} className="text-[var(--text-brand)]" />
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
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--background-secondary)] text-[var(--text-subtle)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Step indicator */}
                <div className="px-6 pt-4 pb-2 shrink-0">
                    <div className="flex items-center gap-2 mb-3">
                        {Array.from({ length: progressSteps }, (_, i) => (
                            <div
                                key={i}
                                className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                                    i < visibleStep ? 'bg-[var(--background-brand-solid)]' : 'bg-[var(--background-secondary)]'
                                }`}
                            />
                        ))}
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-subtlest)]">
                        Step {visibleStep} of {progressSteps} — {STEP_LABELS[step - 1]}
                    </p>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto px-6 py-4 slick-scrollbar">
                    {renderContent()}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-[var(--border-subtlest)] bg-[var(--background-secondary)]/40 flex items-center justify-between shrink-0">
                    {step > 1 ? (
                        <Button variant="secondary" onClick={goBack} disabled={isSubmitting}>Back</Button>
                    ) : (
                        <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                    )}

                    {isLastStep ? (
                        <Button
                            variant="primary"
                            onClick={handleConfirm}
                            disabled={isSubmitting}
                            isLoading={isSubmitting}
                        >
                            {isSubmitting ? 'Confirming...' : 'Confirm Extension'}
                        </Button>
                    ) : (
                        <Button variant="primary" onClick={goNext} disabled={!canContinue}>
                            Continue
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
