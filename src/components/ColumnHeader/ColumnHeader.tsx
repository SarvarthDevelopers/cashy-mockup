import React, { forwardRef } from 'react';
import styles from './ColumnHeader.module.css';
import { ConfigIcon } from './icons/ConfigIcon';
import { PlusIcon } from './icons/PlusIcon';
import { Tooltip } from '../Tooltip/Tooltip';

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
     * If true, the column is currently in configuration mode
     */
    isConfigActive?: boolean;
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
    ({ title, count = 0, variant = 'admin', isConfigActive = false, onConfigClick, onAddClick, className, ...props }, ref) => {
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
                            <Tooltip content={isConfigActive ? "Close configuration" : "Configure column"}>
                                <button
                                    type="button"
                                    className={isConfigActive ? styles.closeButton : styles.iconButton}
                                    onClick={onConfigClick}
                                    aria-label={isConfigActive ? "Close configuration" : "Configure column"}
                                >
                                    {isConfigActive ? (
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    ) : (
                                        <ConfigIcon width="16" height="16" />
                                    )}
                                </button>
                            </Tooltip>
                        )}
                        
                        <Tooltip content="Add item">
                            <button
                                type="button"
                                className={styles.iconButton}
                                onClick={onAddClick}
                                aria-label="Add item"
                            >
                                <PlusIcon width="16" height="16" />
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </div>
        );
    }
);

ColumnHeader.displayName = 'ColumnHeader';
