import React, { useState } from 'react';
import { Button, Input, Dropdown, Toggle } from '../';
import type { DealData } from '../../data/mockData';
import { 
  X as XIcon, 
  RefreshCw as RefreshCwIcon, 
  Check as CheckIcon, 
  Download as DownloadIcon, 
  Info as InfoIcon,
  AlertTriangle as AlertTriangleIcon
} from 'lucide-react';

export interface PaybackDealModalProps {
    isOpen: boolean;
    onClose: () => void;
    dealData?: DealData;
    onUpdateDeal?: (deal: DealData) => void;
}

// 5 Step labels matching the requirements
const STEP_LABELS = [
    'Deal Summary & Elapsed Days',
    'Fee Overrides & Notes',
    'Inventory Release (Vault Retrieval)',
    'Payment Selection',
    'Confirmation & Receipt',
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
    const cleaned = str.replace(/[€\s]/g, '').replace(/\./g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
}

export const PaybackDealModal: React.FC<PaybackDealModalProps> = ({
    isOpen,
    onClose,
    dealData,
    onUpdateDeal
}) => {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Step variables
    const elapsedDays = 45; // default simulated elapsed days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - elapsedDays);

    // Step 2: Override states
    const [customFees, setCustomFees] = useState('');
    const [feeOverrideReason, setFeeOverrideReason] = useState('');

    // Step 3: Vault release states
    const [removeItemsFromStorage, setRemoveItemsFromStorage] = useState(true);

    // Step 4: Payment states
    const [paymentType, setPaymentType] = useState('Cash');
    const [cashBookName, setCashBookName] = useState(() => {
        return dealData?.countryCode === 'DE' ? 'Munich Main Cash' : 'Vienna Main Cash';
    });



    if (!isOpen || !dealData) return null;

    // --- Calculations ---
    const payoutPrincipal = parseEurAmount(dealData.amount || '0');
    // Base accumulated fees: 4% of principal for each 30-day block (rounded up). 45 days is 2 blocks.
    const calculatedBaseFees = Math.ceil(elapsedDays / 30) * (payoutPrincipal * 0.04);
    
    const finalFees = customFees !== '' ? (parseFloat(customFees) || 0) : calculatedBaseFees;
    const isFeesOverridden = customFees !== '' && parseFloat(customFees) !== calculatedBaseFees;
    const totalCollected = payoutPrincipal + finalFees;

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
                    note: `Items ${removeItemsFromStorage ? 'removed' : 'retained'} - ${dealData.items.join(', ')}`,
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
            setStep(5); // Go to success step
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
            });

            onUpdateDeal({
                ...dealData,
                specialNote: `PAYBACK_META:${meta}`,
            });
        }
        onClose();
    };

    const downloadReceipt = () => {
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
Adjusted Fees:         EUR ${fmtEur(finalFees)}
-----------------------------------------
Total Amount Received: EUR ${fmtEur(totalCollected)}

Payment Method: ${paymentType} ${['Cash', 'Debit/Credit Card'].includes(paymentType) ? `(${cashBookName})` : ''}
Handover Method: ${getHandoverLabel(dealData.pickupType)}
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
        if (step === 2) {
            if (isNotesRequired) return false;
            if (parseFloat(customFees) < 0) return false;
        }
        return true;
    })();

    // Handover labels helper
    function getHandoverLabel(pickupType?: string) {
        if (pickupType === 'STANDARD_SHIPMENT') return 'Standard Shipment';
        if (pickupType === 'STOREBOX') return 'Storebox Lockbox';
        return 'In-Shop Pickup';
    }

    const isCardOrCash = ['Cash', 'Debit/Credit Card'].includes(paymentType);

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
            // ── Step 1: Summary & Calculations ──────────────────────────────────
            case 1:
                return (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
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

            // ── Step 2: Fee Overrides & Notes ────────────────────────────────────
            case 2:
                return (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                        <p className="text-[13px] text-[var(--text-subtle)] leading-relaxed">
                            Apply manual discount or waive fees. Overrides require a written justification.
                        </p>
                        
                        <div className="space-y-4">
                            <Input
                                label="Adjusted Fees Charged (€)"
                                type="number"
                                placeholder={String(calculatedBaseFees)}
                                value={customFees}
                                onChange={(e) => setCustomFees(e.target.value)}
                            />

                            <div className="flex flex-col">
                                <label className="text-[12px] font-bold text-[var(--text-primary)] mb-1.5">
                                    Notes / Justification {isFeesOverridden && <span className="text-red-500">*</span>}
                                </label>
                                <textarea
                                    className={`w-full text-[13px] px-3.5 py-3.5 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] transition-all min-h-[90px] ${
                                        isNotesRequired ? 'border-red-300 bg-red-50/10' : 'border-[var(--border-subtle)]'
                                    }`}
                                    placeholder="Enter operator reason for fee adjustment..."
                                    value={feeOverrideReason}
                                    onChange={(e) => setFeeOverrideReason(e.target.value)}
                                />
                                {isNotesRequired && (
                                    <span className="text-[11px] font-semibold text-red-600 mt-1.5 flex items-center gap-1.5">
                                        <AlertTriangleIcon size={12} />
                                        Written justification is mandatory when fees are overridden.
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="bg-[var(--background-secondary)]/40 rounded-xl border border-[var(--border-subtlest)] p-4 text-xs space-y-2.5">
                            <div className="flex justify-between items-center">
                                <span className="text-[var(--text-subtle)] font-medium">Payout Principal</span>
                                <span className="font-bold text-[var(--text-primary)]">€ {fmtEur(payoutPrincipal)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[var(--text-subtle)] font-medium">Adjusted Fees</span>
                                <span className={`font-bold ${isFeesOverridden ? 'text-[var(--text-brand)]' : 'text-[var(--text-primary)]'}`}>
                                    € {fmtEur(finalFees)}
                                </span>
                            </div>
                            <div className="border-t border-[var(--border-subtlest)] pt-2.5 flex justify-between items-center text-sm">
                                <span className="text-[var(--text-primary)] font-bold">Total Redemption Sum</span>
                                <span className="text-[var(--text-brand)] font-black text-base">€ {fmtEur(totalCollected)}</span>
                            </div>
                        </div>
                    </div>
                );

            // ── Step 3: Inventory Release ────────────────────────────────────────
            case 3:
                return (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                        <p className="text-[13px] text-[var(--text-subtle)] leading-relaxed">
                            Configure physical storage retrieval. Handover details are read-only and pre-configured.
                        </p>

                        <div className="bg-[var(--background-secondary)]/40 p-4 rounded-xl border border-[var(--border-subtlest)] space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[13px] text-[var(--text-subtle)] font-medium">Handover Method</span>
                                <span className="px-3 py-1 bg-[var(--background-primary)] border border-[var(--border-subtle)] text-[12px] font-bold rounded-full text-[var(--text-primary)]">
                                    {getHandoverLabel(dealData.pickupType)}
                                </span>
                            </div>

                            <div className="border-t border-[var(--border-subtlest)] pt-4 flex items-center justify-between">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[13px] font-bold text-[var(--text-primary)]">Remove items from storage today?</span>
                                    <span className="text-[11px] text-[var(--text-subtle)]">Confirm physical retrieval from vault</span>
                                </div>
                                <Toggle
                                    checked={removeItemsFromStorage}
                                    onChange={(e) => setRemoveItemsFromStorage(e.target.checked)}
                                />
                            </div>
                        </div>

                        {/* Handover Notice Card */}
                        <div className={`p-4 border rounded-xl flex gap-3 shadow-sm animate-in fade-in duration-200 ${
                            !removeItemsFromStorage 
                                ? 'border-amber-200 bg-amber-50/50 text-amber-900' 
                                : 'border-blue-200 bg-blue-50/50 text-blue-900'
                        }`}>
                            <InfoIcon size={16} className={`shrink-0 mt-0.5 ${!removeItemsFromStorage ? 'text-amber-600' : 'text-blue-600'}`} />
                            <div className="text-[12px] leading-relaxed">
                                {!removeItemsFromStorage ? (
                                    <p className="font-semibold text-amber-800">
                                        Vault Retention: Items will remain in storage. Status will be updated to CLOSED (retaining vault storage).
                                    </p>
                                ) : dealData.pickupType === 'STANDARD_SHIPMENT' ? (
                                    <p className="font-semibold text-blue-800">
                                        Standard Shipment: An automated shipping label will be generated upon confirmation.
                                    </p>
                                ) : (
                                    <p className="font-semibold text-blue-800">
                                        In-Shop: Customer will retrieve items immediately at the {dealData.countryCode === 'DE' ? 'Munich' : 'Vienna'} register.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                );

            // ── Step 4: Payment Selection ────────────────────────────────────────
            case 4:
                return (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
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

            // ── Step 5: Success & Receipt ────────────────────────────────────────
            case 5:
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

            default:
                return null;
        }
    };

    const isLastStepBeforeSuccess = step === 4;
    const isSuccessStep = step === 5;

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

                {/* Step indicator */}
                {!isSuccessStep && (
                    <div className="px-6 pt-4 pb-2 shrink-0">
                        <div className="flex items-center gap-2 mb-3">
                            {Array.from({ length: TOTAL_STEPS - 1 }, (_, i) => (
                                <div
                                    key={i}
                                    className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                                        i < step ? 'bg-[var(--background-brand-solid)]' : 'bg-[var(--background-secondary)]'
                                    }`}
                                />
                            ))}
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-subtlest)]">
                            Step {step} of {TOTAL_STEPS - 1} — {STEP_LABELS[step - 1]}
                        </p>
                    </div>
                )}

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto px-6 py-4 slick-scrollbar">
                    {renderContent()}
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
                                <Button variant="primary" onClick={goNext} disabled={!canContinue} className="cursor-pointer">
                                    Continue
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
