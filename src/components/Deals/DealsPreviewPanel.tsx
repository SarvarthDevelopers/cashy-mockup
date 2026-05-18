import { useState, useEffect } from 'react';
import { X, ExternalLink, FileWarning, RefreshCw, MessageSquare, ArrowRight, Package } from 'lucide-react';
import { motion } from 'motion/react';
import type { Deal } from '../../data/mockDeals';
import { BUSINESS_AREA_COLORS, STATUS_STYLES } from '../../data/mockDeals';
import { ShopLabel } from '../Card/ShopLabel';

interface DealsPreviewPanelProps {
  deal: Deal | null;
  isLoading?: boolean;
  onClose: () => void;
  onOpenWizard: (deal: Deal) => void;
}

function formatEur(value: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Mock timeline events builder
function generateTimeline(deal: Deal) {
  const events = [
    { type: 'created', label: 'Deal created', date: deal.createdAt, icon: Package },
    { type: 'column', label: `Moved to ${deal.column}`, date: deal.lastColumnLabelAssignedAt, icon: ArrowRight },
  ];
  if (deal.hasMissingDocs) {
    events.push({ type: 'warning', label: 'Missing documents flagged', date: new Date(new Date(deal.createdAt).getTime() + 86400000).toISOString(), icon: FileWarning });
  }
  if (deal.isExtension) {
    events.push({ type: 'extension', label: 'Extension applied', date: new Date(new Date(deal.createdAt).getTime() + 172800000).toISOString(), icon: RefreshCw });
  }
  if (deal.notes) {
    events.push({ type: 'note', label: deal.notes, date: new Date(new Date(deal.createdAt).getTime() + 3600000).toISOString(), icon: MessageSquare });
  }
  return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Premium pulsing skeleton loader structure
function PanelSkeleton() {
  return (
    <div className="flex flex-col h-full animate-pulse select-none bg-[var(--background-primary)]">
      {/* Header Skeleton */}
      <div className="px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--background-secondary)] flex justify-between items-center shrink-0">
        <div className="flex gap-2">
          <div className="h-4 w-20 bg-[var(--border-subtle)] rounded-full" />
          <div className="h-4 w-16 bg-[var(--border-subtle)] rounded-full" />
        </div>
        <div className="h-7 w-7 bg-[var(--border-subtle)] rounded-lg" />
      </div>
      {/* Scrollable Skeletons */}
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-[var(--border-subtle)] rounded-full" />
          <div className="h-5 w-20 bg-[var(--border-subtle)] rounded-full" />
          <div className="h-5 w-24 bg-[var(--border-subtle)] rounded-full" />
        </div>
        
        {/* Customer Block Loader */}
        <div className="flex flex-col gap-2.5 pb-4 border-b border-[var(--border-subtle)]">
          <div className="h-3 w-14 bg-[var(--border-subtle)] rounded" />
          <div className="h-5 w-40 bg-[var(--border-subtle)] rounded" />
          <div className="h-3.5 w-32 bg-[var(--border-subtle)] rounded" />
        </div>

        {/* Items Block Loader */}
        <div className="flex flex-col gap-2.5 pb-4 border-b border-[var(--border-subtle)]">
          <div className="h-3 w-20 bg-[var(--border-subtle)] rounded" />
          <div className="h-16 bg-[var(--border-subtle)] rounded-xl" />
        </div>

        {/* Financials Block Loader */}
        <div className="flex flex-col gap-2">
          <div className="h-3 w-24 bg-[var(--border-subtle)] rounded" />
          <div className="h-20 bg-[var(--border-subtle)] rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function DealsPreviewPanel({ deal, isLoading = false, onClose, onOpenWizard }: DealsPreviewPanelProps) {
  const [isMobile, setIsMobile] = useState(false);

  // Keyboard navigation capturing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Mobile layout detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!deal) return null;

  const areaColor = BUSINESS_AREA_COLORS[deal.businessArea] || '#6b7280';
  const statusStyle = STATUS_STYLES[deal.status];
  const timeline = generateTimeline(deal);

  const fees = deal.totalMarketValue * 0.05; // 5% fee model
  const ltv = deal.suggestedPayout / deal.totalMarketValue;

  // Swipe handle touch header element for mobile screens
  const mobileSwipeHandle = isMobile && (
    <div className="w-full flex justify-center py-2 shrink-0 bg-[var(--background-secondary)] cursor-row-resize">
      <div className="w-12 h-1.5 rounded-full bg-[var(--border-subtle)]" />
    </div>
  );

  return (
    <motion.div
      initial={{ x: isMobile ? 0 : 380, y: isMobile ? 400 : 0, opacity: 0 }}
      animate={{ x: 0, y: 0, opacity: 1 }}
      exit={{ x: isMobile ? 0 : 380, y: isMobile ? 500 : 0, opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      // iOS style swipe downward drag dismissal on mobile screens
      drag={isMobile ? 'y' : false}
      dragConstraints={{ top: 0, bottom: 400 }}
      onDragEnd={(_, info) => {
        if (info.offset.y > 150) onClose();
      }}
      className={`
        bg-[var(--background-primary)] border-[var(--border-subtle)] flex flex-col h-full overflow-hidden shrink-0 shadow-2xl z-45
        ${isMobile 
          ? 'fixed inset-x-0 bottom-0 top-12 rounded-t-2xl max-w-full w-full' 
          : 'w-96 border-l border-t-0 rounded-l-none'
        }
      `}
      role="dialog"
      aria-label={`Deal Preview details for ${deal.dealId}`}
    >
      {/* Mobile Swipe Handle bar indicator */}
      {mobileSwipeHandle}

      {isLoading ? (
        <PanelSkeleton />
      ) : (
        <>
          {/* Header */}
          <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0 bg-[var(--background-secondary)] select-none">
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-black text-[var(--text-primary)]">{deal.dealId}</span>
              <span
                className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shadow-sm"
                style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
              >
                {deal.status.replace('_', ' ')}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-[var(--background-primary)] border border-transparent hover:border-[var(--border-subtle)] rounded-lg transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-brand)]"
              aria-label="Close deal preview side sheet"
            >
              <X size={16} className="text-[var(--text-subtlest)] hover:text-[var(--text-primary)]" />
            </button>
          </div>

          {/* Scrollable details view */}
          <div className="flex-1 overflow-y-auto slick-scrollbar pb-6">
            {/* Summary badges Section */}
            <div className="px-5 py-3.5 flex items-center gap-1.5 flex-wrap border-b border-[var(--border-subtle)] bg-[var(--background-secondary)]/20">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                deal.mode === 'custom_deal' 
                  ? 'bg-[var(--background-brand-primary)] text-[var(--text-brand)] border border-[var(--border-brand-subtle)]' 
                  : 'bg-[var(--background-brand-solid)]/10 text-[var(--text-brand)] border border-[var(--border-brand-subtle)]'
              }`}>
                {deal.mode === 'custom_deal' ? 'Purchase' : 'Pawn'}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-[var(--background-secondary)] text-[var(--text-subtle)] border border-[var(--border-subtle)]">
                {deal.businessUnit}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black text-white shadow-sm" style={{ backgroundColor: areaColor }}>
                {deal.businessArea}
              </span>
            </div>

            {/* Customer Section */}
            <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex flex-col gap-2">
              <h4 className="text-[9px] font-black text-[var(--text-subtlest)] uppercase tracking-wider">Customer Profile</h4>
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-black text-[var(--text-primary)]">
                  {deal.primaryCustomer.firstName} {deal.primaryCustomer.lastName}
                </span>
                <span className="text-xs text-[var(--text-subtle)] font-semibold">{deal.primaryCustomer.email}</span>
                <span className="text-xs text-[var(--text-subtle)] font-semibold">{deal.primaryCustomer.phone}</span>
              </div>
            </div>

            {/* Items Section */}
            <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex flex-col gap-2.5">
              <h4 className="text-[9px] font-black text-[var(--text-subtlest)] uppercase tracking-wider">
                Collateral Items ({deal.items.length})
              </h4>
              <div className="flex flex-col gap-2">
                {deal.items.map(item => (
                  <div key={item.itemId} className="flex items-center justify-between p-3 bg-[var(--background-secondary)] rounded-xl border border-[var(--border-subtle)] shadow-sm">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-black text-[var(--text-primary)]">{item.title}</span>
                      <span className="text-[10px] font-bold text-[var(--text-subtlest)]">{item.variant}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-black text-[var(--text-primary)]">{formatEur(item.marketValue)}</span>
                      <span className="text-[10px] font-black text-[var(--text-brand)]">Asked {formatEur(item.requestedPayout)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Calculations Snapshot Section */}
            <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex flex-col gap-3">
              <h4 className="text-[9px] font-black text-[var(--text-subtlest)] uppercase tracking-wider">Financial Calculations</h4>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[var(--text-subtle)]">Total Market Valuation</span>
                  <span className="text-[var(--text-primary)] font-bold">{formatEur(deal.totalMarketValue)}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[var(--text-subtle)]">LTV (Loan-To-Value) Ratio</span>
                  <span className="text-[var(--text-primary)] font-bold">{(ltv * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[var(--text-subtle)]">Est. Operational Fees</span>
                  <span className="text-[var(--text-error)] font-black">− {formatEur(fees)}</span>
                </div>
                <div className="h-[1.5px] bg-[var(--border-subtle)] my-1.5" />
                <div className="flex justify-between text-sm items-center py-0.5">
                  <span className="font-black text-[var(--text-primary)]">Payout</span>
                  <span className={`font-black text-base tabular-nums ${
                    [
                      'VERIFIED',
                      'PAYED_AND_STORED',
                      'LOAN_DUE_NOTIFIED',
                      'LOAN_DUE',
                      'EXTENSION_CONFIRMED',
                      'PAYBACK_CONFIRMED',
                      'PAYED_SHIPMENT_PENDING',
                      'CLOSED',
                      'ON_SELL',
                      'SOLD_INTERN',
                      'SOLD_EXTERN',
                      'PICKED_UP'
                    ].includes(deal.status)
                      ? 'text-[var(--text-success)]'
                      : 'text-[var(--text-primary)]'
                  }`}>{formatEur(deal.suggestedPayout)}</span>
                </div>
              </div>
            </div>

            {/* Warning Flags Section */}
            {(deal.hasMissingDocs || deal.isExtension) && (
              <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex flex-col gap-2">
                {deal.hasMissingDocs && (
                  <div className="flex items-start gap-2.5 p-3 bg-[var(--background-secondary)] border border-[var(--border-subtle)] rounded-xl shadow-sm">
                    <FileWarning size={16} className="text-[var(--text-error)] shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-extrabold text-[var(--text-primary)]">Missing Owner Documents</span>
                      <p className="text-[11px] text-[var(--text-subtle)] leading-relaxed">Required customer identification, pawn sheets, or item registration paperwork are currently incomplete.</p>
                    </div>
                  </div>
                )}
                {deal.isExtension && (
                  <div className="flex items-start gap-2.5 p-3 bg-[var(--background-brand-primary)] border border-[var(--border-brand-subtle)] rounded-xl shadow-sm">
                    <RefreshCw size={16} className="text-[var(--text-brand)] shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-extrabold text-[var(--text-brand)]">Extension Contract</span>
                      <p className="text-[11px] text-[var(--text-subtle)] leading-relaxed">This deal represents a rollover term extension derived from a previous pawn contract index.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Deal Details Grid Section */}
            <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex flex-col gap-2.5">
              <h4 className="text-[9px] font-black text-[var(--text-subtlest)] uppercase tracking-wider">Audit Metadata</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 select-none">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-[var(--text-subtlest)] font-bold uppercase">Company</span>
                  <span className="text-xs text-[var(--text-primary)] font-bold">{deal.company}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-[var(--text-subtlest)] font-bold uppercase">Branch / Shop</span>
                  <div className="flex items-center">
                    <ShopLabel country={deal.branch} branch={deal.shop} />
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-[var(--text-subtlest)] font-bold uppercase">Term Duration</span>
                  <span className="text-xs text-[var(--text-primary)] font-bold">{deal.durationDays} days</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-[var(--text-subtlest)] font-bold uppercase">Due Date</span>
                  <span className="text-xs text-[var(--text-primary)] font-bold">{deal.dueDate}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-[var(--text-subtlest)] font-bold uppercase">Pickup Method</span>
                  <span className="text-xs text-[var(--text-primary)] font-bold">{deal.pickupType.replace('_', ' ')}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-[var(--text-subtlest)] font-bold uppercase">Assigned To</span>
                  <span className="text-xs text-[var(--text-primary)] font-bold">{deal.assignedTo}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-[var(--text-subtlest)] font-bold uppercase">Kanban Column</span>
                  <span className="text-xs text-[var(--text-primary)] font-bold">{deal.column}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-[var(--text-subtlest)] font-bold uppercase">Priority Level</span>
                  <span className={`text-xs font-black ${deal.priority === 'High' ? 'text-[var(--text-error)]' : deal.priority === 'Medium' ? 'text-[var(--text-brand)]' : 'text-[var(--text-subtlest)]'}`}>
                    {deal.priority}
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline Section */}
            <div className="px-5 py-4">
              <h4 className="text-[9px] font-black text-[var(--text-subtlest)] uppercase tracking-wider mb-3">Lifecycle Timeline</h4>
              <div className="flex flex-col">
                {timeline.map((event, idx) => {
                  const Icon = event.icon;
                  return (
                    <div key={idx} className="flex gap-2.5 relative">
                      {idx < timeline.length - 1 && (
                        <div className="absolute left-[9.5px] top-6 bottom-0 w-[1.5px] bg-[var(--border-subtle)]" />
                      )}
                      <div className="w-5 h-5 rounded-full bg-[var(--background-secondary)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0 mt-0.5 z-10">
                        <Icon size={10} className="text-[var(--text-subtle)]" />
                      </div>
                      <div className="flex flex-col pb-3.5">
                        <span className="text-xs font-bold text-[var(--text-primary)] leading-tight">{event.label}</span>
                        <span className="text-[10px] font-black text-[var(--text-subtlest)] mt-0.5">{formatDate(event.date)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sticky footer CTAs section */}
          <div className="px-5 py-4 border-t border-[var(--border-subtle)] shrink-0 bg-[var(--background-secondary)] sticky bottom-0 z-10 shadow-inner">
            <button 
              onClick={() => onOpenWizard(deal)}
              className="w-full h-10 flex items-center justify-center gap-2 px-4 bg-[var(--background-brand-solid)] text-white font-extrabold rounded-lg text-sm hover:bg-[var(--background-brand-solid-hover)] transition-all shadow-lg shadow-[var(--lilac-100)] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-brand)]"
            >
              <ExternalLink size={14} />
              <span>Open Deal Wizard</span>
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}
