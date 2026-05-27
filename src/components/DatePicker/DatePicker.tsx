import { forwardRef, useState, useEffect, useId } from 'react';
import * as Popover from '@radix-ui/react-popover';
import styles from './DatePicker.module.css';

export interface DatePickerProps {
    label?: string;
    value?: Date | null;
    defaultValue?: Date | null;
    onChange?: (date: Date | null) => void;
    placeholder?: string;
    error?: boolean;
    errorMessage?: string;
    helperText?: string;
    disabled?: boolean;
    className?: string;
    minDate?: Date;
    maxDate?: Date;
}

const DAYS_OF_WEEK = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const formatSelectedDate = (date: Date | null): string => {
    if (!date) return '';
    const monthIndex = date.getMonth();
    if (isNaN(monthIndex) || !MONTHS[monthIndex]) return '';
    const day = date.getDate();
    const month = MONTHS[monthIndex].slice(0, 3);
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
};

export const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(
    ({
        label,
        value,
        defaultValue = null,
        onChange,
        placeholder = 'Select date',
        error = false,
        errorMessage,
        helperText,
        disabled = false,
        className = '',
        minDate,
        maxDate,
        ...props
    }, ref) => {
        const [isOpen, setIsOpen] = useState(false);
        const [selectedDate, setSelectedDate] = useState<Date | null>(defaultValue);

        const isControlled = value !== undefined;
        const activeDate = isControlled ? value : selectedDate;

        const [navMonth, setNavMonth] = useState<number>(() => {
            const date = activeDate || new Date();
            return date.getMonth();
        });
        const [navYear, setNavYear] = useState<number>(() => {
            const date = activeDate || new Date();
            return date.getFullYear();
        });

        useEffect(() => {
            if (activeDate) {
                setNavMonth(activeDate.getMonth());
                setNavYear(activeDate.getFullYear());
            }
        }, [activeDate]);

        const generatedId = useId();
        const triggerId = `datepicker-trigger-${generatedId}`;
        const errorId = errorMessage ? `datepicker-error-${generatedId}` : undefined;
        const helperId = helperText ? `datepicker-helper-${generatedId}` : undefined;
        const describedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined;

        const handlePrevMonth = (e: React.MouseEvent) => {
            e.stopPropagation();
            if (navMonth === 0) {
                setNavMonth(11);
                setNavYear((y) => y - 1);
            } else {
                setNavMonth((m) => m - 1);
            }
        };

        const handleNextMonth = (e: React.MouseEvent) => {
            e.stopPropagation();
            if (navMonth === 11) {
                setNavMonth(0);
                setNavYear((y) => y + 1);
            } else {
                setNavMonth((m) => m + 1);
            }
        };

        const handleDateSelect = (date: Date) => {
            if (disabled) return;
            if (minDate && date < minDate) return;
            if (maxDate && date > maxDate) return;

            if (!isControlled) {
                setSelectedDate(date);
            }
            onChange?.(date);
            setIsOpen(false);
        };

        const handleClear = () => {
            if (disabled) return;
            if (!isControlled) {
                setSelectedDate(null);
            }
            onChange?.(null);
        };

        const getCalendarDays = () => {
            const startDay = new Date(navYear, navMonth, 1).getDay();
            const startOffset = startDay === 0 ? 6 : startDay - 1;

            const daysInPrevMonth = new Date(navYear, navMonth, 0).getDate();
            const daysInCurrentMonth = new Date(navYear, navMonth + 1, 0).getDate();

            const days: { date: Date; isCurrentMonth: boolean }[] = [];

            for (let i = startOffset - 1; i >= 0; i--) {
                const prevYear = navMonth === 0 ? navYear - 1 : navYear;
                const prevMonthIdx = navMonth === 0 ? 11 : navMonth - 1;
                days.push({
                    date: new Date(prevYear, prevMonthIdx, daysInPrevMonth - i),
                    isCurrentMonth: false
                });
            }

            for (let i = 1; i <= daysInCurrentMonth; i++) {
                days.push({
                    date: new Date(navYear, navMonth, i),
                    isCurrentMonth: true
                });
            }

            const remainingCells = 42 - days.length;
            for (let i = 1; i <= remainingCells; i++) {
                const nextYear = navMonth === 11 ? navYear + 1 : navYear;
                const nextMonthIdx = navMonth === 11 ? 0 : navMonth + 1;
                days.push({
                    date: new Date(nextYear, nextMonthIdx, i),
                    isCurrentMonth: false
                });
            }

            return days;
        };

        const calendarDays = getCalendarDays();
        const isSameDay = (d1: Date | null, d2: Date | null) => {
            if (!d1 || !d2) return false;
            return (
                d1.getDate() === d2.getDate() &&
                d1.getMonth() === d2.getMonth() &&
                d1.getFullYear() === d2.getFullYear()
            );
        };

        return (
            <div className={`${styles.container} ${className}`}>
                {label && (
                    <label htmlFor={triggerId} className={styles.label}>
                        {label}
                    </label>
                )}

                <Popover.Root open={isOpen && !disabled} onOpenChange={setIsOpen}>
                    {/* Wrap trigger + clear button in a div so the clear button is a sibling, not nested */}
                    <div className={styles.triggerWrapper}>
                        <Popover.Trigger asChild>
                            <div
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                ref={ref as any}
                                id={triggerId}
                                role="button"
                                tabIndex={0}
                                aria-disabled={disabled}
                                aria-invalid={error}
                                aria-describedby={describedBy}
                                className={`
                                    ${styles.trigger}
                                    ${isOpen ? styles.isOpen : ''}
                                    ${disabled ? styles.disabled : ''}
                                    ${error ? styles.error : ''}
                                `}
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                {...props as any}
                            >
                                <span className={styles.leftSection}>
                                    <span className={styles.icon}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                            <line x1="16" y1="2" x2="16" y2="6"></line>
                                            <line x1="8" y1="2" x2="8" y2="6"></line>
                                            <line x1="3" y1="10" x2="21" y2="10"></line>
                                        </svg>
                                    </span>
                                    <span className={`
                                        ${styles.value} 
                                        ${!activeDate ? styles.placeholder : ''}
                                    `}>
                                        {activeDate ? formatSelectedDate(activeDate) : placeholder}
                                    </span>
                                </span>

                                <span className={styles.rightSection}>
                                    {activeDate && !disabled && (
                                        <button
                                            type="button"
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleClear(); }}
                                            onPointerDown={(e) => e.stopPropagation()}
                                            className={styles.clearButton}
                                            aria-label="Clear date"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                                <line x1="6" y1="6" x2="18" y2="18"></line>
                                            </svg>
                                        </button>
                                    )}
                                    <span className={styles.chevronIcon}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="6 9 12 15 18 9"></polyline>
                                        </svg>
                                    </span>
                                </span>
                            </div>
                        </Popover.Trigger>
                    </div>

                    <Popover.Portal>
                        <Popover.Content className={styles.popoverContent} align="start" sideOffset={6}>
                            <div className={styles.calendar}>
                                <div className={styles.header}>
                                    <button 
                                        type="button" 
                                        onClick={handlePrevMonth} 
                                        className={styles.navButton}
                                        aria-label="Previous Month"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="15 18 9 12 15 6"></polyline>
                                        </svg>
                                    </button>
                                    <span className={styles.monthLabel}>
                                        {MONTHS[navMonth]} {navYear}
                                    </span>
                                    <button 
                                        type="button" 
                                        onClick={handleNextMonth} 
                                        className={styles.navButton}
                                        aria-label="Next Month"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="9 18 15 12 9 6"></polyline>
                                        </svg>
                                    </button>
                                </div>

                                <div className={styles.body}>
                                    <div className={styles.weekdays}>
                                        {DAYS_OF_WEEK.map((day) => (
                                            <span key={day} className={styles.weekday}>
                                                {day}
                                            </span>
                                        ))}
                                    </div>

                                    <div className={styles.daysGrid}>
                                        {calendarDays.map(({ date, isCurrentMonth }, idx) => {
                                            const isSelected = isSameDay(date, activeDate);
                                            const isToday = isSameDay(date, new Date());
                                            const isDisabled = 
                                                (minDate && date < minDate) || 
                                                (maxDate && date > maxDate);

                                            return (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    disabled={isDisabled}
                                                    onClick={() => handleDateSelect(date)}
                                                    className={`
                                                        ${styles.dayCell}
                                                        ${!isCurrentMonth ? styles.outOfMonth : ''}
                                                        ${isSelected ? styles.selected : ''}
                                                        ${isToday && !isSelected ? styles.today : ''}
                                                        ${isDisabled ? styles.disabledCell : ''}
                                                    `}
                                                >
                                                    {date.getDate()}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </Popover.Content>
                    </Popover.Portal>
                </Popover.Root>

                {errorMessage && (
                    <span id={errorId} className={styles.errorMessage}>
                        {errorMessage}
                    </span>
                )}
                {!errorMessage && helperText && (
                    <span id={helperId} className={styles.helperText}>
                        {helperText}
                    </span>
                )}
            </div>
        );
    }
);

DatePicker.displayName = 'DatePicker';
