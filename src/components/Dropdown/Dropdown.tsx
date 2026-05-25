import React, { forwardRef, useState, useRef, useEffect, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
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
        const [focusedIndex, setFocusedIndex] = useState(-1);
        const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

        const triggerRef = useRef<HTMLButtonElement | null>(null);
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
        const activeDescendant = isOpen && focusedIndex >= 0
            ? `${buttonId}-option-${focusedIndex}`
            : undefined;

        const selectedOption = options.find((opt) => opt.value === currentValue);

        // --- Position the portal listbox under the trigger ---
        const calcMenuStyle = useCallback((): React.CSSProperties => {
            if (!triggerRef.current) return {};
            const rect = triggerRef.current.getBoundingClientRect();
            return {
                position: 'fixed',
                top: rect.bottom + 4,
                left: rect.left,
                width: rect.width,
                zIndex: 9999,
            };
        }, []);

        // --- Open / close helpers ---

        const openMenu = useCallback(() => {
            if (disabled) return;
            setMenuStyle(calcMenuStyle());
            const selectedIdx = options.findIndex((o) => o.value === currentValue);
            setFocusedIndex(selectedIdx >= 0 ? selectedIdx : 0);
            setIsOpen(true);
        }, [disabled, options, currentValue, calcMenuStyle]);

        const closeMenu = useCallback(() => {
            setIsOpen(false);
            setFocusedIndex(-1);
            triggerRef.current?.focus();
        }, []);

        // Focus listbox after it mounts
        useEffect(() => {
            if (isOpen) {
                // Small defer so the portal is painted before focus
                const id = requestAnimationFrame(() => {
                    listboxRef.current?.focus();
                });
                return () => cancelAnimationFrame(id);
            }
        }, [isOpen]);

        // Scroll focused option into view
        useEffect(() => {
            if (isOpen && focusedIndex >= 0) {
                optionRefs.current[focusedIndex]?.scrollIntoView({ block: 'nearest' });
            }
        }, [isOpen, focusedIndex]);

        // Close on outside pointer down
        useEffect(() => {
            if (!isOpen) return;
            const handlePointerDown = (e: MouseEvent) => {
                const list = listboxRef.current;
                const trigger = triggerRef.current;
                if (
                    list && !list.contains(e.target as Node) &&
                    trigger && !trigger.contains(e.target as Node)
                ) {
                    setIsOpen(false);
                    setFocusedIndex(-1);
                }
            };
            document.addEventListener('mousedown', handlePointerDown);
            return () => document.removeEventListener('mousedown', handlePointerDown);
        }, [isOpen]);

        // Close on scroll or resize (reposition would be complex; just close)
        useEffect(() => {
            if (!isOpen) return;
            const close = () => { setIsOpen(false); setFocusedIndex(-1); };
            window.addEventListener('scroll', close, { capture: true, passive: true });
            window.addEventListener('resize', close, { passive: true });
            return () => {
                window.removeEventListener('scroll', close, { capture: true });
                window.removeEventListener('resize', close);
            };
        }, [isOpen]);

        // --- Selection ---

        const selectOption = useCallback((optionValue: string) => {
            if (!isControlled) setInternalValue(optionValue);
            onChange?.(optionValue);
            setIsOpen(false);
            setFocusedIndex(-1);
            triggerRef.current?.focus();
        }, [isControlled, onChange]);

        // --- Keyboard: trigger ---

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
                    setMenuStyle(calcMenuStyle());
                    setFocusedIndex(options.length - 1);
                    setIsOpen(true);
                    break;
                case 'Escape':
                    closeMenu();
                    break;
            }
        }, [openMenu, closeMenu, options.length, calcMenuStyle]);

        // --- Keyboard: listbox ---

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
                    setIsOpen(false);
                    setFocusedIndex(-1);
                    break;
            }
        }, [options, focusedIndex, selectOption, closeMenu]);

        // Merge forwarded ref with internal triggerRef
        const setTriggerRef = useCallback((el: HTMLButtonElement | null) => {
            triggerRef.current = el;
            if (typeof ref === 'function') ref(el);
            else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = el;
        }, [ref]);

        return (
            <div className={`${styles.container} ${className ?? ''}`}>
                {label && (
                    <label htmlFor={buttonId} className={styles.label}>
                        {label}
                    </label>
                )}

                <button
                    ref={setTriggerRef}
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

                {isOpen && createPortal(
                    <ul
                        ref={listboxRef}
                        id={listboxId}
                        className={styles.dropdownList}
                        role="listbox"
                        aria-label={label ?? placeholder}
                        tabIndex={-1}
                        style={menuStyle}
                        onKeyDown={handleListKeyDown}
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
                                >
                                    {option.label}
                                </li>
                            );
                        })}
                    </ul>,
                    document.body
                )}

                {errorMessage && <span id={errorId} className={styles.errorMessage}>{errorMessage}</span>}
                {!errorMessage && helperText && <span id={helperId} className={styles.helperText}>{helperText}</span>}
            </div>
        );
    }
);

Dropdown.displayName = 'Dropdown';
