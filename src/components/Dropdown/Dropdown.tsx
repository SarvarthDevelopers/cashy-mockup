import React, { forwardRef, useState, useRef, useEffect, useCallback, useId } from 'react';
import styles from './Dropdown.module.css';

export interface DropdownOption {
    label: string;
    value: string;
}

export interface DropdownProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'defaultValue' | 'onChange'> {
    options: DropdownOption[];
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    label?: string;
    error?: boolean;
    errorMessage?: string;
    helperText?: string;
    required?: boolean;
}

export const Dropdown = forwardRef<HTMLButtonElement, DropdownProps>(
    ({ options, value, defaultValue, onChange, placeholder = 'Select an option', label, error, errorMessage, helperText, disabled, className, ...props }, ref) => {
        const [isOpen, setIsOpen] = useState(false);
        const [internalValue, setInternalValue] = useState(defaultValue);
        // Index of the currently keyboard-focused option (-1 = none)
        const [focusedIndex, setFocusedIndex] = useState(-1);

        const containerRef = useRef<HTMLDivElement>(null);
        const listboxRef = useRef<HTMLUListElement>(null);
        const optionRefs = useRef<Array<HTMLLIElement | null>>([]);

        const isControlled = typeof value !== 'undefined';
        const currentValue = isControlled ? value : internalValue;

        const generatedId = useId();
        const buttonId = props.id ?? generatedId;
        const listboxId = `${buttonId}-listbox`;
        const helperId = helperText ? `${buttonId}-helper` : undefined;
        const errorId = errorMessage ? `${buttonId}-error` : undefined;
        const describedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined;
        // Announce the active option to the trigger's aria-activedescendant
        const activeDescendant = isOpen && focusedIndex >= 0
            ? `${buttonId}-option-${focusedIndex}`
            : undefined;

        const selectedOption = options.find((opt) => opt.value === currentValue);

        // --- Open / close helpers ----------------------------------------

        const openMenu = useCallback(() => {
            if (disabled) return;
            const selectedIdx = options.findIndex((o) => o.value === currentValue);
            setFocusedIndex(selectedIdx >= 0 ? selectedIdx : 0);
            setIsOpen(true);
        }, [disabled, options, currentValue]);

        const closeMenu = useCallback(() => {
            setIsOpen(false);
            setFocusedIndex(-1);
        }, []);

        // Focus the highlighted option whenever focusedIndex changes while open
        useEffect(() => {
            if (isOpen && focusedIndex >= 0) {
                optionRefs.current[focusedIndex]?.scrollIntoView({ block: 'nearest' });
            }
        }, [isOpen, focusedIndex]);

        // Close on outside click
        useEffect(() => {
            if (!isOpen) return;
            const handlePointerDown = (e: MouseEvent) => {
                if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                    closeMenu();
                }
            };
            document.addEventListener('mousedown', handlePointerDown);
            return () => document.removeEventListener('mousedown', handlePointerDown);
        }, [isOpen, closeMenu]);

        // --- Selection ---------------------------------------------------

        const selectOption = useCallback((optionValue: string) => {
            if (!isControlled) setInternalValue(optionValue);
            onChange?.(optionValue);
            closeMenu();
        }, [isControlled, onChange, closeMenu]);

        // --- Keyboard navigation on the trigger button -------------------

        const handleTriggerKeyDown = useCallback((e: React.KeyboardEvent<HTMLButtonElement>) => {
            switch (e.key) {
                case 'Enter':
                case ' ':
                case 'ArrowDown':
                    e.preventDefault();
                    openMenu();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    // Open with last option focused
                    setFocusedIndex(options.length - 1);
                    setIsOpen(true);
                    break;
                case 'Escape':
                    closeMenu();
                    break;
            }
        }, [openMenu, closeMenu, options.length]);

        // --- Keyboard navigation inside the listbox ----------------------

        const handleListKeyDown = useCallback((e: React.KeyboardEvent<HTMLUListElement>) => {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setFocusedIndex((i) => Math.min(i + 1, options.length - 1));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setFocusedIndex((i) => Math.max(i - 1, 0));
                    break;
                case 'Home':
                    e.preventDefault();
                    setFocusedIndex(0);
                    break;
                case 'End':
                    e.preventDefault();
                    setFocusedIndex(options.length - 1);
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    if (focusedIndex >= 0) selectOption(options[focusedIndex].value);
                    break;
                case 'Escape':
                    e.preventDefault();
                    closeMenu();
                    break;
                case 'Tab':
                    closeMenu();
                    break;
            }
        }, [options, focusedIndex, selectOption, closeMenu]);

        return (
            <div className={`${styles.container} ${className ?? ''}`} ref={containerRef}>
                {label && (
                    <label htmlFor={buttonId} className={styles.label}>
                        {label}
                    </label>
                )}

                {/* ── Trigger ─────────────────────────────────────────────── */}
                <button
                    ref={ref}
                    id={buttonId}
                    type="button"
                    className={`
                        ${styles.trigger}
                        ${isOpen ? styles.isOpen : ''}
                        ${disabled ? styles.disabled : ''}
                        ${error ? styles.error : ''}
                    `}
                    onClick={() => (isOpen ? closeMenu() : openMenu())}
                    onKeyDown={handleTriggerKeyDown}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    aria-controls={isOpen ? listboxId : undefined}
                    aria-activedescendant={activeDescendant}
                    disabled={disabled}
                    aria-invalid={!!error}
                    aria-describedby={describedBy}
                    {...props}
                >
                    <div className={styles.content}>
                        {selectedOption ? (
                            <span className={styles.value}>{selectedOption.label}</span>
                        ) : (
                            <span className={`${styles.value} ${styles.placeholder}`}>{placeholder}</span>
                        )}
                    </div>
                    <div className={styles.icon} aria-hidden="true">
                        {isOpen ? (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 12.5L10 7.5L5 12.5" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        )}
                    </div>
                </button>

                {/* ── Listbox ─────────────────────────────────────────────── */}
                {isOpen && (
                    <ul
                        ref={listboxRef}
                        id={listboxId}
                        className={styles.dropdownList}
                        role="listbox"
                        aria-label={label ?? placeholder}
                        tabIndex={-1}
                        onKeyDown={handleListKeyDown}
                        // Keep keyboard focus on the ul so arrow-key events fire here
                        autoFocus
                    >
                        {options.map((option, index) => {
                            const isSelected = option.value === currentValue;
                            const isFocused = index === focusedIndex;
                            return (
                                <li
                                    key={option.value}
                                    id={`${buttonId}-option-${index}`}
                                    ref={(el) => { optionRefs.current[index] = el; }}
                                    role="option"
                                    aria-selected={isSelected}
                                    className={`${styles.item} ${isSelected ? styles.selected : ''} ${isFocused ? styles.focused : ''}`}
                                    onClick={() => selectOption(option.value)}
                                    onMouseEnter={() => setFocusedIndex(index)}
                                    // li is not interactive natively — pointer events handle selection,
                                    // keyboard events are handled on the parent ul.
                                >
                                    {option.label}
                                </li>
                            );
                        })}
                    </ul>
                )}

                {errorMessage && <span id={errorId} className={styles.errorMessage}>{errorMessage}</span>}
                {!errorMessage && helperText && <span id={helperId} className={styles.helperText}>{helperText}</span>}
            </div>
        );
    }
);

Dropdown.displayName = 'Dropdown';
