import React, { forwardRef } from 'react';
import styles from './ColumnHeader.module.css';
import { ConfigIcon } from './icons/ConfigIcon';
import { PlusIcon } from './icons/PlusIcon';

export interface ColumnHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * The title of the column
     */
    title: string;
    /**
     * The number of cards in the column
     */
    count?: number;
    /**
     * Determines which actions are visible
     * "admin" shows both config and add buttons
     * "staff" shows only add button
     */
    variant?: 'admin' | 'staff';
    /**
     * Callback when the config button is clicked
     */
    onConfigClick?: () => void;
    /**
     * Callback when the add button is clicked
     */
    onAddClick?: () => void;
}

export const ColumnHeader = forwardRef<HTMLDivElement, ColumnHeaderProps>(
    ({ title, count = 0, variant = 'admin', onConfigClick, onAddClick, className, ...props }, ref) => {
        return (
            <div ref={ref} className={`${styles.container} ${className || ''}`} {...props}>
                <div className={styles.header}>
                    <div className={styles.titleWrapper}>
                        <h3 className={styles.title} title={title}>
                            {title}
                        </h3>
                    </div>
                    
                    <div className={styles.actions}>
                        <div className={styles.badge} aria-label={`${count} items`}>
                            {count}
                        </div>
                        
                        {variant === 'admin' && (
                            <button
                                type="button"
                                className={styles.iconButton}
                                onClick={onConfigClick}
                                aria-label="Configure column"
                            >
                                <ConfigIcon width="16" height="16" />
                            </button>
                        )}
                        
                        <button
                            type="button"
                            className={styles.iconButton}
                            onClick={onAddClick}
                            aria-label="Add item"
                        >
                            <PlusIcon width="16" height="16" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }
);

ColumnHeader.displayName = 'ColumnHeader';
