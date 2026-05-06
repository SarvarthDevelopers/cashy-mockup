import React from 'react';
import { PaginationArrow } from './PaginationArrow';
import { PaginationNumber } from './PaginationNumber';
import './Pagination.css';


export interface PaginationProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    /**
     * Current active page (1-indexed)
     */
    currentPage: number;
    /**
     * Total number of pages
     */
    totalPages: number;
    /**
     * Callback when page changes
     */
    onPageChange: (page: number) => void;
    /**
     * Variant of the pagination
     */
    variant?: 'simple' | 'entries' | 'count';
    /**
     * Items per page (only for 'entries' variant)
     */
    itemsPerPage?: number;
    /**
     * Callback when items per page changes (only for 'entries' variant)
     */
    onItemsPerPageChange?: (items: number) => void;
    /**
     * Array of options for items per page dropdown
     */
    itemsPerPageOptions?: number[];
    /**
     * Total items count (for 'count' variant display)
     */
    totalItems?: number;
}

export const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(({
    currentPage,
    totalPages,
    onPageChange,
    variant = 'simple',
    itemsPerPage = 10,
    onItemsPerPageChange,
    itemsPerPageOptions = [10, 20, 50, 100],
    // totalItems = 0, // Unused
    className = '',
    ...props
}, ref) => {

    // Generate page numbers logic
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 7; // Max visible page numbers including ellipsis

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Logic for complex pagination with ellipsis
            if (currentPage <= 4) {
                for (let i = 1; i <= 5; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 4; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const isEntries = variant === 'entries';
    const isCount = variant === 'count';

    return (
        <div className={`pagination ${className}`} ref={ref} {...props}>
            {isEntries && (
                <div className="pagination__entries">
                    <select
                        className="pagination__select"
                        value={itemsPerPage}
                        onChange={(e) => onItemsPerPageChange?.(Number(e.target.value))}
                    >
                        {itemsPerPageOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                    <span>Entries per page</span>
                </div>
            )}

            {isCount && (
                <div className="pagination__info">
                    {currentPage} of {totalPages} pages
                </div>
            )}

            {/* Spacer for center alignment in flex if needed, or justify-content logic */}
            {(isEntries || isCount) && <div style={{ flex: 1 }} />}

            <div className="pagination__nav">
                <PaginationArrow
                    direction="left"
                    type={isEntries || isCount ? "text" : "icon-only"}
                    label="Previous"
                    onClick={handlePrevious}
                    disabled={currentPage === 1 || totalPages === 0}
                />

                {getPageNumbers().map((page, index) => (
                    <PaginationNumber
                        key={typeof page === 'number' ? page : `ellipsis-${index}`}
                        isActive={page === currentPage}
                        onClick={() => typeof page === 'number' ? onPageChange(page) : undefined}
                        disabled={typeof page !== 'number'}
                    >
                        {page}
                    </PaginationNumber>
                ))}

                <PaginationArrow
                    direction="right"
                    type={isEntries || isCount ? "text" : "icon-only"}
                    label="Next"
                    onClick={handleNext}
                    disabled={currentPage === totalPages || totalPages === 0}
                />
            </div>
        </div>
    );
});

Pagination.displayName = 'Pagination';
