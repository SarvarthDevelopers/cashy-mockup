import React from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Button } from '../Button/Button';
import { AlertTriangle, AlertOctagon } from 'lucide-react';
import './ConfirmationModal.css';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  variant?: 'danger' | 'warning';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onOpenChange,
  title,
  description,
  variant = 'danger',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm
}) => {
  const isWarning = variant === 'warning';

  return (
    <AlertDialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="cashy-modal-overlay" />
        <AlertDialog.Content className="cashy-modal-content">
          <div className="cashy-modal-header">
            <div className={`cashy-modal-icon-wrapper cashy-modal-icon-wrapper--${variant}`}>
              {isWarning ? (
                <AlertTriangle className="cashy-modal-icon" size={20} />
              ) : (
                <AlertOctagon className="cashy-modal-icon" size={20} />
              )}
            </div>
            <AlertDialog.Title className="cashy-modal-title">{title}</AlertDialog.Title>
          </div>
          
          <AlertDialog.Description className="cashy-modal-description">
            {description}
          </AlertDialog.Description>

          <div className="cashy-modal-actions">
            {isWarning ? (
              <AlertDialog.Action asChild>
                <Button variant="primary" onClick={() => onOpenChange(false)}>
                  {confirmText}
                </Button>
              </AlertDialog.Action>
            ) : (
              <>
                <AlertDialog.Cancel asChild>
                  <Button variant="secondary">
                    {cancelText}
                  </Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action asChild>
                  <Button variant="danger-bold" onClick={onConfirm}>
                    {confirmText}
                  </Button>
                </AlertDialog.Action>
              </>
            )}
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
