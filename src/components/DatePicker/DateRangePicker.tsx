import { forwardRef, useState, useEffect, useId } from 'react';
import * as Popover from '@radix-ui/react-popover';
import styles from './DateRangePicker.module.css';

export interface DateRange {
    from: Date | null;
    to: Date | null;
}

export interface DateRangePickerProps {
    label?: string;
    value?: DateRange;
    defaultValue?: DateRange;
    onChange?: (range: DateRange) => void;
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

const getStartOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const formatSelectedRange = (range: DateRange | null): string => {
    if (!range || (!range.from && !range.to)) return '';
    const format = (d: Date | null) => {
        if (!d) return '';
        const monthIndex = d.getMonth();
        if (isNaN(monthIndex) || !MONTHS[monthIndex]) return '';
        const day = d.getDate();
        const month = MONTHS[monthIndex].slice(0, 3);
        const year = d.getFullYear();
        return `${month} ${day}, ${year}`;
    };
    
    if (range.from && !range.to) {
        return `${format(range.from)} - `;
    }
    if (range.from && range.to) {
        return `${format(range.from)} - ${format(range.to)}`;
    }
    return '';
};

export const DateRangePicker = forwardRef<HTMLButtonElement, DateRangePickerProps>(
    ({
        label,
        value,
        defaultValue = { from: null, to: null },
        onChange,
        placeholder = 'Select date range',
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
        const [selectedRange, setSelectedRange] = useState<DateRange>(defaultValue);

        const isControlled = value !== undefined;
        const activeRange = isControlled ? value : selectedRange;

        // Nav Month holds the left calendar visible month
        const [navMonth, setNavMonth] = useState<number>(() => {
            const date = activeRange.from || new Date();
            return date.getMonth();
        });
        const [navYear, setNavYear] = useState<number>(() => {
            const date = activeRange.from || new Date();
            return date.getFullYear();
        });

        // Right calendar month and year computed
        const rightMonth = navMonth === 11 ? 0 : navMonth + 1;
        const rightYear = navMonth === 11 ? navYear + 1 : navYear;

        useEffect(() => {
            if (activeRange.from) {
                setNavMonth(activeRange.from.getMonth());
                setNavYear(activeRange.from.getFullYear());
            }
        }, [activeRange.from]);

        const generatedId = useId();
        const triggerId = `daterangepicker-trigger-${generatedId}`;
        const errorId = errorMessage ? `daterangepicker-error-${generatedId}` : undefined;
        const helperId = helperText ? `daterangepicker-helper-${generatedId}` : undefined;
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

            const dateStr = getStartOfDay(date);

            let newRange: DateRange;
            if (!activeRange.from || (activeRange.from && activeRange.to)) {
                newRange = { from: dateStr, to: null };
            } else {
                if (dateStr < activeRange.from) {
                    newRange = { from: dateStr, to: null };
                } else {
                    newRange = { from: activeRange.from, to: dateStr };
                    setIsOpen(false); // Auto-close when both ranges chosen
                }
            }

            if (!isControlled) {
                setSelectedRange(newRange);
            }
            onChange?.(newRange);
        };

        const handleClear = () => {
            if (disabled) return;
            const cleared = { from: null, to: null };
            if (!isControlled) {
                setSelectedRange(cleared);
            }
            onChange?.(cleared);
        };

        const applyPreset = (presetType: string) => {
            const today = getStartOfDay(new Date());
            let from: Date | null = null;
            let to: Date | null = null;

            switch (presetType) {
                case 'today':
                    from = today;
                    to = today;
                    break;
                case 'yesterday': {
                    const yest = new Date(today);
                    yest.setDate(yest.getDate() - 1);
                    from = yest;
                    to = yest;
                    break;
                }
                case 'last7': {
                    const prev7 = new Date(today);
                    prev7.setDate(prev7.getDate() - 6);
                    from = prev7;
                    to = today;
                    break;
                }
                case 'last30': {
                    const prev30 = new Date(today);
                    prev30.setDate(prev30.getDate() - 29);
                    from = prev30;
                    to = today;
                    break;
                }
                case 'thisMonth':
                    from = new Date(today.getFullYear(), today.getMonth(), 1);
                    to = today;
                    break;
                case 'lastMonth':
                    from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                    to = new Date(today.getFullYear(), today.getMonth(), 0);
                    break;
                default:
                    break;
            }

            if (from && to) {
                const range = { from, to };
                if (!isControlled) {
                    setSelectedRange(range);
                }
                onChange?.(range);
                setIsOpen(false);
            }
        };

        const getCalendarDays = (month: number, year: number) => {
            const startDay = new Date(year, month, 1).getDay();
            const startOffset = startDay === 0 ? 6 : startDay - 1;

            const daysInPrevMonth = new Date(year, month, 0).getDate();
            const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();

            const days: { date: Date; isCurrentMonth: boolean }[] = [];

            for (let i = startOffset - 1; i >= 0; i--) {
                const prevYear = month === 0 ? year - 1 : year;
                const prevMonthIdx = month === 0 ? 11 : month - 1;
                days.push({
                    date: new Date(prevYear, prevMonthIdx, daysInPrevMonth - i),
                    isCurrentMonth: false
                });
            }

            for (let i = 1; i <= daysInCurrentMonth; i++) {
                days.push({
                    date: new Date(year, month, i),
                    isCurrentMonth: true
                });
            }

            const remainingCells = 42 - days.length;
            for (let i = 1; i <= remainingCells; i++) {
                const nextYear = month === 11 ? year + 1 : year;
                const nextMonthIdx = month === 11 ? 0 : month + 1;
                days.push({
                    date: new Date(nextYear, nextMonthIdx, i),
                    isCurrentMonth: false
                });
            }

            return days;
        };

        const leftDays = getCalendarDays(navMonth, navYear);
        const rightDays = getCalendarDays(rightMonth, rightYear);

        const isSameDay = (d1: Date | null, d2: Date | null) => {
            if (!d1 || !d2) return false;
            return (
                d1.getDate() === d2.getDate() &&
                d1.getMonth() === d2.getMonth() &&
                d1.getFullYear() === d2.getFullYear()
            );
        };

        const isBetween = (d: Date) => {
            if (!activeRange.from || !activeRange.to) return false;
            return d > activeRange.from && d < activeRange.to;
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
                                        ${!activeRange.from ? styles.placeholder : ''}
                                    `}>
                                        {activeRange.from ? formatSelectedRange(activeRange) : placeholder}
                                    </span>
                                </span>

                                <span className={styles.rightSection}>
                                    {activeRange.from && !disabled && (
                                        <button
                                            type="button"
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleClear(); }}
                                            onPointerDown={(e) => e.stopPropagation()}
                                            className={styles.clearButton}
                                            aria-label="Clear date range"
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
                            <div className={styles.pickerPanel}>
                                {/* Presets Sidebar */}
                                <div className={styles.sidebar}>
                                    <button type="button" onClick={() => applyPreset('today')} className={styles.sidebarButton}>Today</button>
                                    <button type="button" onClick={() => applyPreset('yesterday')} className={styles.sidebarButton}>Yesterday</button>
                                    <button type="button" onClick={() => applyPreset('last7')} className={styles.sidebarButton}>Last 7 days</button>
                                    <button type="button" onClick={() => applyPreset('last30')} className={styles.sidebarButton}>Last 30 days</button>
                                    <button type="button" onClick={() => applyPreset('thisMonth')} className={styles.sidebarButton}>This month</button>
                                    <button type="button" onClick={() => applyPreset('lastMonth')} className={styles.sidebarButton}>Last month</button>
                                </div>

                                <div className={styles.verticalDivider} />

                                {/* Side-by-Side Calendars */}
                                <div className={styles.calendarsContainer}>
                                    {/* Left Month Calendar */}
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
                                                className={`${styles.navButton} ${styles.nextMonthMobileOnly}`}
                                                aria-label="Next Month"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="9 18 15 12 9 6"></polyline>
                                                </svg>
                                            </button>
                                            <span className={styles.ghostNavButton} />
                                        </div>

                                        <div className={styles.body}>
                                            <div className={styles.weekdays}>
                                                {DAYS_OF_WEEK.map((day) => (
                                                    <span key={day} className={styles.weekday}>{day}</span>
                                                ))}
                                            </div>

                                            <div className={styles.daysGrid}>
                                                {leftDays.map(({ date, isCurrentMonth }, idx) => {
                                                    const isStart = isSameDay(date, activeRange.from);
                                                    const isEnd = isSameDay(date, activeRange.to);
                                                    const isRange = isBetween(date);
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
                                                                ${isStart ? styles.selectedStart : ''}
                                                                ${isEnd ? styles.selectedEnd : ''}
                                                                ${isRange ? styles.inRange : ''}
                                                                ${isToday && !isStart && !isEnd ? styles.today : ''}
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

                                    <div className={styles.calendarDivider} />

                                    {/* Right Month Calendar */}
                                    <div className={styles.calendar}>
                                        <div className={styles.header}>
                                            <span className={styles.ghostNavButton} />
                                            <span className={styles.monthLabel}>
                                                {MONTHS[rightMonth]} {rightYear}
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
                                                    <span key={day} className={styles.weekday}>{day}</span>
                                                ))}
                                            </div>

                                            <div className={styles.daysGrid}>
                                                {rightDays.map(({ date, isCurrentMonth }, idx) => {
                                                    const isStart = isSameDay(date, activeRange.from);
                                                    const isEnd = isSameDay(date, activeRange.to);
                                                    const isRange = isBetween(date);
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
                                                                ${isStart ? styles.selectedStart : ''}
                                                                ${isEnd ? styles.selectedEnd : ''}
                                                                ${isRange ? styles.inRange : ''}
                                                                ${isToday && !isStart && !isEnd ? styles.today : ''}
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

DateRangePicker.displayName = 'DateRangePicker';
