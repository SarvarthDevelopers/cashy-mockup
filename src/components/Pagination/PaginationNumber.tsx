import React from 'react';
import './PaginationNumber.css';

export interface PaginationNumberProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /**
     * The page number or label (e.g. "...")
     */
    children: React.ReactNode;
    /**
     * Whether this page is currently active
     */
    isActive?: boolean;
}

export const PaginationNumber = React.forwardRef<HTMLButtonElement, PaginationNumberProps>(({
    children,
    isActive = false,
    className = '',
    ...props
}, ref) => {
    return (
        <button
            type="button"
            className={`pagination-number ${isActive ? 'pagination-number--active' : ''} ${className}`}
            aria-current={isActive ? 'page' : undefined}
            ref={ref}
            {...props}
        >
            {children}
        </button>
    );
});

PaginationNumber.displayName = 'PaginationNumber';
