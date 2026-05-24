import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import './TaskCard.css';

// ─── Constants ───────────────────────────────────────────────────────────────

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
] as const;

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

// ─── Utility helpers ─────────────────────────────────────────────────────────

/** Compares two dates at day-level (ignores time). */
function isSameDay(a: Date, b: Date): boolean {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

/**
 * Builds a 2-D array of week rows for the given month.
 * Each cell contains the `Date` and whether it belongs to the current month.
 */
function getCalendarDays(year: number, month: number) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // ISO week: Monday = 0, Sunday = 6
    const startOffset = (firstDay.getDay() + 6) % 7; // getDay() returns 0=Sun

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    for (let i = startOffset - 1; i >= 0; i--) {
        days.push({ date: new Date(year, month, -i), isCurrentMonth: false });
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
        days.push({ date: new Date(year, month, d), isCurrentMonth: true });
    }
    const trailing = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= trailing; i++) {
        days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    const weeks: (typeof days)[] = [];
    for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7));
    }
    return weeks;
}

// ─── CalendarSmall ───────────────────────────────────────────────────────────

interface CalendarSmallProps {
    /** Currently selected date. */
    selectedDate: Date | null;
    /** Fires when the user picks a date. */
    onDateSelect: (date: Date) => void;
    /** Dates strictly before this value are disabled. */
    minDate?: Date;
}

/**
 * `CalendarSmall` is a compact, single-month date picker.
 * Rendered via a React portal in `TaskCreateCardLarge` to escape overflow clipping.
 */
export const CalendarSmall: React.FC<CalendarSmallProps> = ({
    selectedDate,
    onDateSelect,
    minDate,
}) => {
    const today = useMemo(() => new Date(), []);
    const [viewYear, setViewYear] = useState(selectedDate?.getFullYear() ?? today.getFullYear());
    const [viewMonth, setViewMonth] = useState(selectedDate?.getMonth() ?? today.getMonth());

    const weeks = useMemo(() => getCalendarDays(viewYear, viewMonth), [viewYear, viewMonth]);

    const handlePrevMonth = useCallback(() => {
        setViewMonth((m) => {
            if (m === 0) { setViewYear((y) => y - 1); return 11; }
            return m - 1;
        });
    }, []);

    const handleNextMonth = useCallback(() => {
        setViewMonth((m) => {
            if (m === 11) { setViewYear((y) => y + 1); return 0; }
            return m + 1;
        });
    }, []);

    const isDateDisabled = useCallback((date: Date): boolean => {
        if (!minDate) return false;
        const min = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
        return new Date(date.getFullYear(), date.getMonth(), date.getDate()) < min;
    }, [minDate]);

    return (
        <div className="task-calendar" role="dialog" aria-label="Date picker" aria-modal="true">
            {/* Month navigation header */}
            <div className="task-calendar__header">
                <button
                    type="button"
                    className="task-calendar__nav-btn"
                    onClick={handlePrevMonth}
                    aria-label="Previous month"
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                <p className="task-calendar__month-year" aria-live="polite">
                    {MONTH_NAMES[viewMonth]} {viewYear}
                </p>
                <button
                    type="button"
                    className="task-calendar__nav-btn"
                    onClick={handleNextMonth}
                    aria-label="Next month"
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>

            <div className="task-calendar__divider" />

            {/* Date grid */}
            <div className="task-calendar__body">
                <div className="task-calendar__day-names" aria-hidden="true">
                    {DAY_NAMES.map((day) => (
                        <span key={day} className="task-calendar__day-name">{day}</span>
                    ))}
                </div>

                {weeks.map((week) => (
                    <div
                        key={week[0].date.toISOString()}
                        className="task-calendar__date-row"
                    >
                        {week.map((day) => {
                            const isSelected = selectedDate ? isSameDay(day.date, selectedDate) : false;
                            const isDisabled = !day.isCurrentMonth || isDateDisabled(day.date);
                            const isToday = isSameDay(day.date, today);
                            const dateKey = day.date.toISOString().slice(0, 10);

                            const cls = [
                                'task-calendar__date',
                                isSelected && 'task-calendar__date--selected',
                                isDisabled && 'task-calendar__date--disabled',
                                isToday   && 'task-calendar__date--today',
                            ].filter(Boolean).join(' ');

                            return (
                                <button
                                    key={dateKey}
                                    type="button"
                                    className={cls}
                                    onClick={() => onDateSelect(day.date)}
                                    disabled={isDisabled}
                                    aria-label={day.date.toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                    aria-selected={isSelected}
                                    aria-pressed={undefined}
                                >
                                    {day.date.getDate()}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

CalendarSmall.displayName = 'CalendarSmall';

// ─── CalendarIcon ─────────────────────────────────────────────────────────────

const CalendarIcon: React.FC = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path
            d="M4.66675 1.16675V2.91675M9.33341 1.16675V2.91675M1.75008 5.54175H12.2501M2.33341 2.33341H11.6667C11.9889 2.33341 12.2501 2.59461 12.2501 2.91675V12.2501C12.2501 12.5722 11.9889 12.8334 11.6667 12.8334H2.33341C2.01128 12.8334 1.75008 12.5722 1.75008 12.2501V2.91675C1.75008 2.59461 2.01128 2.33341 2.33341 2.33341Z"
            stroke="currentColor"
            strokeWidth="1.16667"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

// ─── TaskCreateCardLarge ──────────────────────────────────────────────────────

export type PriorityOption = 'today' | 'tomorrow' | 'custom';

export interface TaskCreateCardLargeProps {
    /**
     * Called when the user submits the form.
     * Receives `title`, `description`, and the computed `dueDate`.
     */
    onAdd: (data: { title: string; description: string; dueDate: Date }) => void;
    /** Called when the user dismisses the form without saving. */
    onCancel: () => void;
    /** Optional additional CSS class for the root element. */
    className?: string;
    /** Optional initial title for editing */
    initialTitle?: string;
    /** Optional initial description for editing */
    initialDescription?: string;
    /** Optional initial due date for editing */
    initialDueDate?: Date;
    /** Optional custom submit button label */
    submitLabel?: string;
    /** Optional custom header title */
    headerTitle?: string;
}

/**
 * `TaskCreateCardLarge` is the inline task creation form that appears
 * when the ➕ button on a `ColumnHeader` is clicked.
 *
 * Priority is inferred from the due date selection:
 * - **Today** pill  → high priority
 * - **Tomorrow** pill → medium priority
 * - **Calendar** icon → low priority (custom date ≥ day after tomorrow)
 */
export const TaskCreateCardLarge = React.forwardRef<HTMLDivElement, TaskCreateCardLargeProps>((
    { 
        onAdd, 
        onCancel, 
        className, 
        initialTitle, 
        initialDescription, 
        initialDueDate, 
        submitLabel = 'Add', 
        headerTitle = 'Adding task' 
    },
    ref,
) => {
    const [title, setTitle] = useState(initialTitle ?? '');
    const [description, setDescription] = useState(initialDescription ?? '');
    const [selectedPriority, setSelectedPriority] = useState<PriorityOption>(() => {
        if (!initialDueDate) return 'today';
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dateMs = new Date(initialDueDate.getFullYear(), initialDueDate.getMonth(), initialDueDate.getDate()).getTime();
        const todayMs = today.getTime();
        if (dateMs === todayMs) return 'today';
        if (dateMs === todayMs + 86_400_000) return 'tomorrow';
        return 'custom';
    });
    const [customDate, setCustomDate] = useState<Date | null>(() => {
        if (!initialDueDate) return null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dateMs = new Date(initialDueDate.getFullYear(), initialDueDate.getMonth(), initialDueDate.getDate()).getTime();
        const todayMs = today.getTime();
        if (dateMs !== todayMs && dateMs !== todayMs + 86_400_000) {
            return initialDueDate;
        }
        return null;
    });
    const [showCalendar, setShowCalendar] = useState(false);
    const [calendarPos, setCalendarPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

    const calendarRef = useRef<HTMLDivElement>(null);
    const calendarBtnRef = useRef<HTMLButtonElement>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);

    // Minimum date for the custom calendar (day after tomorrow — today & tomorrow have pills)
    const minCalendarDate = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() + 2);
        return d;
    }, []);

    // Auto-focus the title input when the form mounts
    useEffect(() => {
        titleInputRef.current?.focus();
    }, []);

    // Close calendar when clicking outside both the portal and the trigger button
    useEffect(() => {
        if (!showCalendar) return;
        const handlePointerDown = (e: MouseEvent) => {
            if (
                !calendarRef.current?.contains(e.target as Node) &&
                !calendarBtnRef.current?.contains(e.target as Node)
            ) {
                setShowCalendar(false);
            }
        };
        document.addEventListener('mousedown', handlePointerDown);
        return () => document.removeEventListener('mousedown', handlePointerDown);
    }, [showCalendar]);

    // Reposition the calendar portal whenever it opens
    useEffect(() => {
        if (!showCalendar || !calendarBtnRef.current) return;
        const rect = calendarBtnRef.current.getBoundingClientRect();
        setCalendarPos({
            top: rect.bottom + 6,
            left: Math.max(8, rect.right - 240), // right-align to button, min 8px from edge
        });
    }, [showCalendar]);

    // Derive due date from the selected priority option
    const getDueDate = useCallback((): Date => {
        const today = new Date();
        const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        if (selectedPriority === 'today') return base;
        if (selectedPriority === 'tomorrow') return new Date(base.getTime() + 86_400_000);
        return customDate ?? new Date(base.getTime() + 2 * 86_400_000);
    }, [selectedPriority, customDate]);

    const formattedCustomDate = useMemo(() => (
        customDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) ?? ''
    ), [customDate]);

    const isAddDisabled = !title.trim();

    const handleAdd = useCallback(() => {
        if (isAddDisabled) return;
        onAdd({ title: title.trim(), description: description.trim(), dueDate: getDueDate() });
    }, [isAddDisabled, onAdd, title, description, getDueDate]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdd(); }
        if (e.key === 'Escape') { onCancel(); }
    }, [handleAdd, onCancel]);

    const handleTodayClick = useCallback(() => {
        setSelectedPriority('today');
        setShowCalendar(false);
    }, []);

    const handleTomorrowClick = useCallback(() => {
        setSelectedPriority('tomorrow');
        setShowCalendar(false);
    }, []);

    const handleCalendarBtnClick = useCallback(() => {
        setShowCalendar((prev) => !prev);
    }, []);

    const handleCalendarDateSelect = useCallback((date: Date) => {
        setCustomDate(date);
        setSelectedPriority('custom');
        setShowCalendar(false);
    }, []);

    const calendarAriaLabel = selectedPriority === 'custom' && customDate
        ? `Custom date: ${formattedCustomDate}`
        : 'Pick a custom date';

    return (
        <div
            ref={ref}
            className={['task-create-card', className].filter(Boolean).join(' ')}
            onKeyDown={handleKeyDown}
        >
            {/* Header: label + Cancel/Add buttons */}
            <div className="task-create-card__header">
                <p className="task-create-card__header-title">{headerTitle}</p>
                <div className="task-create-card__header-buttons">
                    <button
                        type="button"
                        className="task-create-card__btn task-create-card__btn--cancel"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="task-create-card__btn task-create-card__btn--add"
                        onClick={handleAdd}
                        disabled={isAddDisabled}
                    >
                        {submitLabel}
                    </button>
                </div>
            </div>

            {/* Inputs */}
            <div className="task-create-card__content">
                <input
                    ref={titleInputRef}
                    type="text"
                    className="task-create-card__input"
                    placeholder="Write a task..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value.slice(0, 60))}
                    maxLength={60}
                    aria-label="Task title"
                />
                <textarea
                    className="task-create-card__textarea"
                    placeholder={`Optional description...\n(Max 100 characters)`}
                    value={description}
                    onChange={(e) => setDescription(e.target.value.slice(0, 100))}
                    maxLength={100}
                    aria-label="Task description"
                />
            </div>

            {/* Priority selector pills */}
            <div className="task-create-card__priority">
                <p className="task-create-card__priority-label">Priority:</p>
                <div className="task-create-card__priority-pills">
                    <button
                        type="button"
                        className={`task-create-card__pill${selectedPriority === 'today' ? ' task-create-card__pill--active-high' : ''}`}
                        onClick={handleTodayClick}
                        aria-pressed={selectedPriority === 'today'}
                    >
                        Today
                    </button>
                    <button
                        type="button"
                        className={`task-create-card__pill${selectedPriority === 'tomorrow' ? ' task-create-card__pill--active-medium' : ''}`}
                        onClick={handleTomorrowClick}
                        aria-pressed={selectedPriority === 'tomorrow'}
                    >
                        Tomorrow
                    </button>

                    {/* Calendar pill — renders a portal to escape column overflow */}
                    <div style={{ position: 'relative' }}>
                        <button
                            ref={calendarBtnRef}
                            type="button"
                            className={`task-create-card__pill task-create-card__pill--icon${selectedPriority === 'custom' ? ' task-create-card__pill--active-low' : ''}`}
                            onClick={handleCalendarBtnClick}
                            aria-label={calendarAriaLabel}
                            aria-pressed={selectedPriority === 'custom'}
                            aria-haspopup="dialog"
                            aria-expanded={showCalendar}
                        >
                            <CalendarIcon />
                        </button>
                        {showCalendar && createPortal(
                            <div
                                ref={calendarRef}
                                className="task-calendar-portal"
                                style={{ top: calendarPos.top, left: calendarPos.left }}
                            >
                                <CalendarSmall
                                    selectedDate={customDate}
                                    onDateSelect={handleCalendarDateSelect}
                                    minDate={minCalendarDate}
                                />
                            </div>,
                            document.body,
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

TaskCreateCardLarge.displayName = 'TaskCreateCardLarge';
