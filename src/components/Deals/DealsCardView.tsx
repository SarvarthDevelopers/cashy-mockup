import type { Deal } from '../../data/mockDeals';
import { STATUS_STYLES } from '../../data/mockDeals';
import { ShopLabel } from '../Card/ShopLabel';

interface DealsCardViewProps {
  deals: Deal[];
  selectedRows: Set<string>;
  onSelectionChange: (selected: Set<string>) => void;
  onRowClick: (deal: Deal) => void;
  activeDealId: string | null;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

function formatEur(value: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

function relativeDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' });
}

export function DealsCardView({
  deals,
  selectedRows,
  onSelectionChange,
  onRowClick,
  activeDealId,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
}: DealsCardViewProps) {
  const totalPages = Math.ceil(deals.length / pageSize);
  const paginatedDeals = deals.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleRow = (dealId: string) => {
    const newSet = new Set(selectedRows);
    if (newSet.has(dealId)) newSet.delete(dealId);
    else newSet.add(dealId);
    onSelectionChange(newSet);
  };

  // Keyboard navigation inside grid cards
  const handleCardKeyDown = (e: React.KeyboardEvent, deal: Deal, idx: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextCard = document.querySelector(`[data-card-index="${idx + 1}"]`) as HTMLElement;
      if (nextCard) nextCard.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevCard = document.querySelector(`[data-card-index="${idx - 1}"]`) as HTMLElement;
      if (prevCard) prevCard.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      // Navigate to row below (assume 3 columns on large screen, fallback to 1)
      const isLarge = window.innerWidth >= 1280;
      const step = isLarge ? 3 : 2;
      const nextCard = document.querySelector(`[data-card-index="${idx + step}"]`) as HTMLElement;
      if (nextCard) nextCard.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const isLarge = window.innerWidth >= 1280;
      const step = isLarge ? 3 : 2;
      const prevCard = document.querySelector(`[data-card-index="${idx - step}"]`) as HTMLElement;
      if (prevCard) prevCard.focus();
    } else if (e.key === ' ') {
      e.preventDefault();
      toggleRow(deal.dealId);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      onRowClick(deal);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-w-0 h-full select-none" role="grid" aria-label="Deals card browse layout">
      {/* Cards grid */}
      <div className="flex-1 overflow-y-auto slick-scrollbar pr-1.5 pb-2">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 pt-1">
          {paginatedDeals.map((deal, idx) => {
            const isSelected = selectedRows.has(deal.dealId);
            const isActive = activeDealId === deal.dealId;
            const statusStyle = STATUS_STYLES[deal.status];

            return (
              <div
                key={deal.dealId}
                data-card-index={idx}
                tabIndex={0}
                onKeyDown={(e) => handleCardKeyDown(e, deal, idx)}
                onClick={() => onRowClick(deal)}
                className={`relative bg-[var(--background-primary)] rounded-xl border overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 p-4 pl-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-brand)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--background-primary)] ${
                  isActive 
                    ? 'border-[var(--border-brand)] ring-2 ring-[var(--border-brand)]/20 shadow-md bg-[var(--background-brand-primary)]' 
                    : isSelected 
                      ? 'border-[var(--border-brand)]/40 bg-[var(--background-brand-primary)]/40 hover:bg-[var(--background-brand-primary)]/60' 
                      : 'border-[var(--border-subtle)] hover:border-[var(--border-brand-hover)]'
                }`}
                role="gridcell"
                aria-selected={isActive}
              >
                <div className="flex flex-col gap-2.5">
                  {/* Top row: checkbox + dealId + status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-all shrink-0 ${
                          isSelected 
                            ? 'bg-[var(--background-brand-solid)] border-[var(--border-brand)] text-white shadow-sm' 
                            : 'border-[var(--border-subtle)] bg-[var(--background-primary)]'
                        }`}
                        onClick={(e) => { e.stopPropagation(); toggleRow(deal.dealId); }}
                        role="checkbox"
                        aria-checked={isSelected}
                      >
                        {isSelected && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span className="text-xs font-black text-[var(--text-primary)]">{deal.dealId}</span>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                        deal.mode === 'custom_deal' 
                          ? 'bg-[var(--background-brand-primary)] text-[var(--text-brand)] border border-[var(--border-brand-subtle)]' 
                          : 'bg-[var(--background-brand-solid)]/10 text-[var(--text-brand)] border border-[var(--border-brand-subtle)]'
                      }`}>
                        {deal.mode === 'custom_deal' ? 'Purchase' : 'Pawn'}
                      </span>
                    </div>
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wider uppercase shadow-sm"
                      style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                    >
                      {deal.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Customer & Shop label */}
                  <div className="flex flex-col gap-1">
                    <div className="text-sm font-black text-[var(--text-primary)]">
                      {deal.primaryCustomer.firstName} {deal.primaryCustomer.lastName}
                    </div>
                    <div className="flex items-center">
                      <ShopLabel country={deal.branch} branch={deal.shop} />
                    </div>
                  </div>

                  {/* Primary item */}
                  <div className="text-xs text-[var(--text-subtle)] font-semibold flex flex-col gap-0.5">
                    <span className="text-[10px] text-[var(--text-subtlest)] font-black uppercase tracking-wider">Primary Item</span>
                    <div className="truncate font-bold text-[var(--text-primary)]">
                      {deal.items[0]?.title || '—'}
                      {deal.items.length > 1 && (
                        <span className="text-[10px] text-[var(--text-brand)] font-black ml-1.5">+{deal.items.length - 1} more</span>
                      )}
                    </div>
                  </div>

                  {/* Bottom row: payout + date + flags */}
                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] mt-1">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-[var(--text-subtlest)] font-bold uppercase tracking-wider">Payout</span>
                        <span className={`text-xs tabular-nums ${
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
                            ? 'text-[var(--text-success)] font-black'
                            : 'text-[var(--text-primary)] font-semibold'
                        }`}>{formatEur(deal.suggestedPayout)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-[var(--text-subtlest)]">{relativeDate(deal.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between px-1 py-2 shrink-0">
        <span className="text-xs text-[var(--text-subtlest)] font-bold">
          Showing {Math.min((currentPage - 1) * pageSize + 1, deals.length)}–{Math.min(currentPage * pageSize, deals.length)} of {deals.length}
        </span>
        <div className="flex items-center gap-2.5">
          <select
            value={pageSize}
            onChange={(e) => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
            className="h-8 px-2.5 text-xs bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-subtle)] focus:outline-none focus:border-[var(--border-brand)] cursor-pointer transition-all font-bold shadow-sm"
          >
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 text-xs font-bold text-[var(--text-subtle)] hover:bg-[var(--background-secondary)] rounded-lg transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer border border-[var(--border-subtle)] bg-[var(--background-primary)] shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-brand)]"
            >
              ←
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
              Math.max(0, currentPage - 3),
              Math.min(totalPages, currentPage + 2)
            ).map(page => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer border focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-brand)] ${
                  page === currentPage 
                    ? 'bg-[var(--background-brand-solid)] border-[var(--border-brand)] text-white font-extrabold shadow-sm' 
                    : 'text-[var(--text-subtle)] border-[var(--border-subtle)] bg-[var(--background-primary)] hover:bg-[var(--background-secondary)]'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1.5 text-xs font-bold text-[var(--text-subtle)] hover:bg-[var(--background-secondary)] rounded-lg transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer border border-[var(--border-subtle)] bg-[var(--background-primary)] shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-brand)]"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
