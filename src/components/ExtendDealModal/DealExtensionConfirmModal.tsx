import React from 'react';
import styles from './DealExtensionConfirmModal.module.css';
import { Button } from '../Button/Button';
import { Download, RefreshCw, ExternalLink } from 'lucide-react';

export interface DealExtensionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewChild?: () => void;
  dealId?: string;
  childDealId?: string;
  customerName?: string;
  amountPaid?: string;
  newDueDate?: string;
  nextFeeRate?: string;
  cashBookName?: string;
  pdfLink?: string;
}

export const DealExtensionConfirmModal: React.FC<DealExtensionConfirmModalProps> = ({
  isOpen,
  onClose,
  onViewChild,
  dealId = '—',
  childDealId = '—',
  customerName = 'Customer',
  amountPaid = '€ 0,00',
  newDueDate = '—',
  nextFeeRate = 'Standard (4% / month)',
  cashBookName = 'Store CashBook',
  pdfLink,
}) => {
  if (!isOpen) return null;

  const handleDownloadReceipt = () => {
    if (pdfLink) {
      window.open(pdfLink, '_blank');
      return;
    }

    const receiptContent = `=====================================================
          CASHY EXTENSION RECEIPT (VERLÄNGERUNGSSCHEIN)
=====================================================
Date of Transaction: ${new Date().toLocaleDateString('de-DE')} ${new Date().toLocaleTimeString('de-DE')}
Originating Contract (Parent): #${dealId}
New Contract Reference (Child): #${childDealId}
Borrower / Customer:          ${customerName}
CashBook Ledger Till:         ${cashBookName}

FINANCIAL SETTLEMENT TODAY
-----------------------------------------------------
Accrued Parent Term Fees:     ${amountPaid}
Total Cash/Card Inflow:       ${amountPaid}
Status:                       SETTLED & RECORDED

NEW CONTRACT TERMS (CHILD)
-----------------------------------------------------
New Maturity Due Date:        ${newDueDate}
Upcoming Monthly Fee Rate:    ${nextFeeRate}
Collateral Holding Status:    Retained in Store Vault

Authorized Counter Clerk:     Store Operator
=====================================================
Thank you for banking with CASHY!
`;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CASHY_Verlaengerungsschein_${childDealId}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <RefreshCw size={24} strokeWidth={2.2} />
            </div>
            <div>
              <h2 className={styles.headerTitle}>Extend Deal (Contract Rollover)</h2>
              <p className={styles.headerSubtitle}>
                Parent Deal #{dealId}
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
            <h3 className={styles.successTitle}>Extension Confirmed!</h3>
            <p className={styles.successMessage}>
              Parent contract rollover completed. New child deal contract{' '}
              <span className={styles.highlightAmount}>#{childDealId}</span> was created, and transaction of{' '}
              <span className={styles.highlightAmount}>{amountPaid}</span> was synced to the Cashbook Ledger.
            </p>
          </div>

          <div className={styles.detailsCard}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Parent Contract ID:</span>
              <span className={styles.detailValue}>#{dealId}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>New Child Contract ID:</span>
              <span className={`${styles.detailValue} ${styles.detailValueSuccess}`}>#{childDealId}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Customer:</span>
              <span className={styles.detailValue}>{customerName}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Fees Settled Today:</span>
              <span className={`${styles.detailValue} ${styles.detailValueSuccess}`}>{amountPaid}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>New Maturity Due Date:</span>
              <span className={styles.detailValue}>{newDueDate}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Next Cycle Fee Rate:</span>
              <span className={styles.detailValue}>{nextFeeRate}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Store CashBook:</span>
              <span className={styles.detailValue}>{cashBookName}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Collateral Vault Status:</span>
              <span className={styles.detailValue}>Retained in vault</span>
            </div>
          </div>

          <button
            className={styles.receiptBtn}
            onClick={handleDownloadReceipt}
          >
            <Download size={18} />
            Print / Download Extension Receipt (PDF)
          </button>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          {onViewChild && (
            <Button
              variant="secondary"
              onClick={onViewChild}
              iconRight={<ExternalLink size={14} />}
            >
              Open Child Deal
            </Button>
          )}
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        </div>

      </div>
    </div>
  );
};
