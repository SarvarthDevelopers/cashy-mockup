import { useState, useEffect, useMemo } from 'react';
import { X, ExternalLink, Calendar, MapPin, Mail, Phone } from 'lucide-react';
import { motion } from 'motion/react';
import type { Customer } from '../../data/mockCustomers';
import { MOCK_DEALS } from '../../data/mockDeals';
import type { Deal } from '../../data/mockDeals';
import { STATUS_STYLES } from '../../data/mockDeals';

interface CustomersPreviewPanelProps {
  customer: Customer | null;
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

const STATUS_BADGE_STYLES: Record<Customer['status'], { bg: string; text: string }> = {
  'ACTIVE': { bg: '#ecfdf5', text: '#047857' },
  'INACTIVE': { bg: '#f3f4f6', text: '#4b5563' },
  'BLACKLISTED': { bg: '#fee2e2', text: '#dc2626' }
};

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
        <div className="flex flex-col gap-2.5 pb-4 border-b border-[var(--border-subtle)]">
          <div className="h-3 w-14 bg-[var(--border-subtle)] rounded" />
          <div className="h-5 w-40 bg-[var(--border-subtle)] rounded" />
          <div className="h-3.5 w-32 bg-[var(--border-subtle)] rounded" />
        </div>
        <div className="flex flex-col gap-2.5 pb-4 border-b border-[var(--border-subtle)]">
          <div className="h-3 w-20 bg-[var(--border-subtle)] rounded" />
          <div className="h-16 bg-[var(--border-subtle)] rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function CustomersPreviewPanel({
  customer,
  isLoading = false,
  onClose,
  onOpenWizard,
}: CustomersPreviewPanelProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter deals belonging to this customer
  const customerDeals = useMemo(() => {
    if (!customer) return [];
    const email = customer.email.toLowerCase().trim();
    return MOCK_DEALS.filter(d => d.primaryCustomer.email.toLowerCase().trim() === email);
  }, [customer]);

  // Aggregate all items from customer's deals
  const customerItems = useMemo(() => {
    return customerDeals.flatMap(deal => 
      deal.items.map(item => ({
        ...item,
        dealId: deal.dealId,
        dealStatus: deal.status,
        dealMode: deal.mode
      }))
    );
  }, [customerDeals]);

  if (!customer) return null;

  const statusStyle = STATUS_BADGE_STYLES[customer.status];

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
      drag={isMobile ? 'y' : false}
      dragConstraints={{ top: 0, bottom: 400 }}
      onDragEnd={(_, info) => {
        if (info.offset.y > 150) onClose();
      }}
      className={`
        bg-[var(--background-primary)] border-[var(--border-subtle)] flex flex-col h-full overflow-hidden shrink-0 z-45
        ${isMobile 
          ? 'fixed inset-x-0 bottom-0 top-12 rounded-t-2xl max-w-full w-full' 
          : 'w-96 border-l border-t-0 rounded-l-none'
        }
      `}
      role="dialog"
      aria-label={`Customer Preview details for ${customer.customerId}`}
    >
      {mobileSwipeHandle}

      {isLoading ? (
        <PanelSkeleton />
      ) : (
        <>
          {/* Header */}
          <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0 bg-[var(--background-secondary)] select-none">
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-black text-[var(--text-primary)]">{customer.customerId}</span>
              <span
                className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider"
                style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
              >
                {customer.status}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-[var(--background-primary)] border border-transparent hover:border-[var(--border-subtle)] rounded-lg transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-brand)] border-none bg-transparent"
              aria-label="Close customer preview side sheet"
            >
              <X size={16} strokeWidth={1.5} className="text-[var(--text-subtlest)] hover:text-[var(--text-primary)]" />
            </button>
          </div>

          {/* Scrollable details */}
          <div className="flex-1 overflow-y-auto slick-scrollbar pb-6">
            
            {/* Core Info */}
            <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex flex-col gap-3.5">
              <div className="flex flex-col">
                <h3 className="text-lg font-black text-[var(--text-primary)] leading-snug">
                  {customer.firstName} {customer.lastName}
                </h3>
                <span className="text-xs text-[var(--text-subtlest)] font-semibold mt-0.5 flex items-center gap-1">
                  <Calendar size={12} />
                  Created {formatDate(customer.createdAt)}
                </span>
              </div>

              <div className="flex flex-col gap-2.5 text-xs text-[var(--text-subtle)] font-medium">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-[var(--text-subtlest)]" />
                  <a href={`mailto:${customer.email}`} className="hover:underline hover:text-[var(--text-brand)]">{customer.email}</a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-[var(--text-subtlest)]" />
                  <span>{customer.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-[var(--text-subtlest)]" />
                  <span>{customer.city}, {customer.country}</span>
                </div>
              </div>
            </div>

            {/* Financial Overview */}
            <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex flex-col gap-3">
              <h4 className="text-[9px] font-black text-[var(--text-subtlest)] uppercase tracking-wider">Financial Summary</h4>
              <div className="grid grid-cols-2 gap-3.5">
                <div className="bg-[var(--background-secondary)] border border-[var(--border-subtle)] rounded-xl p-3 flex flex-col">
                  <span className="text-[10px] font-bold text-[var(--text-subtlest)] uppercase tracking-wider">Total Volume</span>
                  <span className="text-base font-black text-[var(--text-success)] mt-1 tabular-nums">{formatEur(customer.totalVolume)}</span>
                </div>
                <div className="bg-[var(--background-secondary)] border border-[var(--border-subtle)] rounded-xl p-3 flex flex-col">
                  <span className="text-[10px] font-bold text-[var(--text-subtlest)] uppercase tracking-wider">Total Deals</span>
                  <span className="text-base font-black text-[var(--text-primary)] mt-1">{customer.totalDeals}</span>
                </div>
              </div>
            </div>



            {/* Connected Deals List */}
            <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex flex-col gap-3">
              <h4 className="text-[9px] font-black text-[var(--text-subtlest)] uppercase tracking-wider">Associated Deals ({customerDeals.length})</h4>
              <div className="flex flex-col gap-2">
                {customerDeals.map((deal) => {
                  const dStyle = STATUS_STYLES[deal.status] || { bg: '#f3f4f6', text: '#374151' };
                  return (
                    <div 
                      key={deal.dealId}
                      className="flex flex-col p-3 rounded-xl bg-[var(--background-secondary)] border border-[var(--border-subtle)] hover:border-[var(--border-brand)] transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onOpenWizard(deal)}
                            className="text-xs font-bold text-[#4649e5] hover:text-[#3b3ec3] hover:underline flex items-center gap-1 border-none bg-transparent cursor-pointer"
                          >
                            <span>{deal.dealId}</span>
                            <ExternalLink size={10} />
                          </button>
                          <span className="text-[10px] text-[var(--text-subtlest)] font-bold capitalize">({deal.mode === 'custom_deal' ? 'Purchase' : 'Pawn'})</span>
                        </div>
                        <span 
                          className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded"
                          style={{ backgroundColor: dStyle.bg, color: dStyle.text }}
                        >
                          {deal.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-[11px] text-[var(--text-subtle)] font-medium">
                        <span>{formatDate(deal.createdAt)}</span>
                        <span className="font-bold text-[var(--text-primary)]">{formatEur(deal.suggestedPayout)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Collateral Items List */}
            <div className="px-5 py-4 flex flex-col gap-3">
              <h4 className="text-[9px] font-black text-[var(--text-subtlest)] uppercase tracking-wider">Collateral Items ({customerItems.length})</h4>
              <div className="flex flex-col gap-2">
                {customerItems.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--background-secondary)]/50 flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-[var(--text-primary)] truncate max-w-[160px]">{item.title}</span>
                      <span className="text-[var(--text-subtlest)]">{item.itemId}</span>
                    </div>
                    <span className="text-[10px] text-[var(--text-subtlest)] font-medium capitalize">{item.variant || 'Standard Variant'}</span>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-[var(--text-subtle)] font-semibold">
                      <span>Value: {formatEur(item.marketValue)}</span>
                      <span className="text-[var(--text-success)]">Payout: {formatEur(item.requestedPayout)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </>
      )}
    </motion.div>
  );
}
