import React from 'react';
import './PaginationArrow.css';

export interface PaginationArrowProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
    /**
     * Direction of the arrow
     */
    direction: 'left' | 'right';
    /**
     * Type of arrow button
     */
    type?: 'icon-only' | 'text';
    /**
     * Label for text type (e.g. "Previous", "Next")
     */
    label?: string;
}

const ChevronLeft = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M10.7071 2.29289C11.0976 2.68342 11.0976 3.31658 10.7071 3.70711L6.41421 8L10.7071 12.2929C11.0976 12.6834 11.0976 13.3166 10.7071 13.7071C10.3166 14.0976 9.68342 14.0976 9.29289 13.7071L4.29289 8.70711C3.90237 8.31658 3.90237 7.68342 4.29289 7.29289L9.29289 2.29289C9.68342 1.90237 10.3166 1.90237 10.7071 2.29289Z" />
    </svg>
);

const ChevronRight = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M5.29289 2.29289C4.90237 2.68342 4.90237 3.31658 5.29289 3.70711L9.58579 8L5.29289 12.2929C4.90237 12.6834 4.90237 13.3166 5.29289 13.7071C5.68342 14.0976 6.31658 14.0976 6.70711 13.7071L11.7071 8.70711C12.0976 8.31658 12.0976 7.68342 11.7071 7.29289L6.70711 2.29289C6.31658 1.90237 5.68342 1.90237 5.29289 2.29289Z" />
    </svg>
);

export const PaginationArrow = React.forwardRef<HTMLButtonElement, PaginationArrowProps>(({
    direction,
    type = 'icon-only',
    label,
    className = '',
    ...props
}, ref) => {
    const Icon = direction === 'left' ? ChevronLeft : ChevronRight;
    const isText = type === 'text';
    
    return (
        <button
            type="button"
            className={`pagination-arrow ${isText ? 'pagination-arrow--text' : ''} ${className}`}
            ref={ref}
            {...props}
        >
            {direction === 'left' && <Icon />}
            {isText && label && <span>{label}</span>}
            {direction === 'right' && <Icon />}
        </button>
    );
});

PaginationArrow.displayName = 'PaginationArrow';
