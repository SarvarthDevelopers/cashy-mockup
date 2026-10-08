import React from 'react';
import styles from './DealPaybackConfirmModal.module.css';
import { Button } from '../Button/Button';
import { Download, RefreshCw } from 'lucide-react';

export interface DealPaybackConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  dealId?: string;
  customerName?: string;
  amountPaid?: string;
  inventoryCheckout?: string;
  cashBookName?: string;
  onDownloadReceipt?: () => void;
}

export const DealPaybackConfirmModal: React.FC<DealPaybackConfirmModalProps> = ({
  isOpen,
  onClose,
  dealId = '—',
  customerName = 'Customer',
  amountPaid = '€ 0,00',
  inventoryCheckout = 'Retrieved today',
  cashBookName = 'Store CashBook',
  onDownloadReceipt,
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <RefreshCw size={22} strokeWidth={2.2} />
            </div>
            <div>
              <h2 className={styles.headerTitle}>Payback Deal (Redemption)</h2>
              <p className={styles.headerSubtitle}>
                Deal #{dealId}
                <span className={styles.dot} />
                {customerName}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={styles.contentArea}>
          <svg className={styles.successIcon} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="38" stroke="currentColor" strokeWidth="4" />
            <path d="M25 40L35 50L55 30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          <div>
            <h3 className={styles.successTitle}>Payback Confirmed!</h3>
            <p className={styles.successMessage}>
              Deal status has been updated. The transaction of{' '}
              <span className={styles.highlightAmount}>{amountPaid}</span> was synced to the Cashbook Ledger.
            </p>
          </div>

          <div className={styles.detailsCard}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Deal ID:</span>
              <span className={styles.detailValue}>#{dealId}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Customer:</span>
              <span className={styles.detailValue}>{customerName}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Amount Paid:</span>
              <span className={`${styles.detailValue} ${styles.detailValueSuccess}`}>{amountPaid}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Store CashBook:</span>
              <span className={styles.detailValue}>{cashBookName}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Inventory checkout:</span>
              <span className={styles.detailValue}>{inventoryCheckout}</span>
            </div>
          </div>

          {onDownloadReceipt && (
            <button
              className={styles.receiptBtn}
              onClick={onDownloadReceipt}
            >
              <Download size={16} />
              Print / Download Receipt (PDF)
            </button>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        </div>

      </div>
    </div>
  );
};
