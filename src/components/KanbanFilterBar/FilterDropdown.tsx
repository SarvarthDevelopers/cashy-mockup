import React, { useState, useRef, useEffect } from 'react';
import styles from './FilterDropdown.module.css';

export interface FilterDropdownProps {
    id: string;
    placeholder: string;
    options: string[];
    selected: string[];
    onChange: (values: string[]) => void;
    renderLabel?: (value: string) => string;
    minWidth?: number;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
    id,
    placeholder,
    options,
    selected,
    onChange,
    renderLabel,
    minWidth = 120,
}) => {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open]);

    // Auto-focus list on open for keyboard nav
    useEffect(() => {
        if (open) listRef.current?.focus();
    }, [open]);

    const toggle = (value: string) => {
        if (selected.includes(value)) {
            onChange(selected.filter(v => v !== value));
        } else {
            onChange([...selected, value]);
        }
    };

    const clearAll = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange([]);
    };

    const hasSelection = selected.length > 0;

    // Build the trigger label text
    const triggerText = hasSelection
        ? selected.length === 1
            ? (renderLabel ? renderLabel(selected[0]) : selected[0])
            : `${selected.length} selected`
        : placeholder;

    return (
        <div
            ref={containerRef}
            className={styles.root}
            style={{ minWidth }}
        >
            {/* ── Trigger — mirrors Dropdown.module.css .trigger ── */}
            <button
                id={id}
                type="button"
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => setOpen(prev => !prev)}
                className={[
                    styles.trigger,
                    hasSelection ? styles.triggerActive : '',
                    open ? styles.triggerOpen : '',
                ].filter(Boolean).join(' ')}
            >
                {/* Content area — text + badge */}
                <div className={styles.triggerContent}>
                    <span className={`${styles.triggerLabel} ${hasSelection ? styles.triggerLabelActive : ''}`}>
                        {triggerText}
                    </span>

                    {/* Count badge — only when multiple are selected */}
                    {selected.length > 1 && (
                        <span className={styles.badge} aria-label={`${selected.length} selected`}>
                            {selected.length}
                        </span>
                    )}
                </div>

                {/* Chevron icon — mirrors .icon */}
                <div className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} aria-hidden="true">
                    {open ? (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 12.5L10 7.5L5 12.5" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </div>
            </button>

            {/* ── Dropdown panel — mirrors .dropdownList ── */}
            {open && (
                <ul
                    ref={listRef}
                    className={styles.panel}
                    role="listbox"
                    aria-multiselectable="true"
                    aria-label={placeholder}
                    tabIndex={-1}
                >
                    {/* Panel header */}
                    <div className={styles.panelHeader}>
                        <span className={styles.panelTitle}>{placeholder}</span>
                        {hasSelection && (
                            <button
                                type="button"
                                className={styles.clearBtn}
                                onClick={clearAll}
                                aria-label={`Clear ${placeholder} filter`}
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {/* Options — each mirrors .item */}
                    <ul className={styles.optionList}>
                        {options.map(opt => {
                            const checked = selected.includes(opt);
                            const displayLabel = renderLabel ? renderLabel(opt) : opt;

                            return (
                                <li key={opt} role="option" aria-selected={checked}>
                                    <button
                                        type="button"
                                        className={[
                                            styles.option,
                                            checked ? styles.optionChecked : '',
                                        ].filter(Boolean).join(' ')}
                                        onClick={() => toggle(opt)}
                                    >
                                        {/* Checkbox — mirrors Checkbox.css .checkbox__control */}
                                        <span className={`${styles.checkbox} ${checked ? styles.checkboxChecked : ''}`} aria-hidden="true">
                                            <span className={styles.checkboxIcon}>
                                                {checked && (
                                                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                                                        <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                )}
                                            </span>
                                        </span>

                                        <span className={styles.optionLabel}>{displayLabel}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </ul>
            )}
        </div>
    );
};
