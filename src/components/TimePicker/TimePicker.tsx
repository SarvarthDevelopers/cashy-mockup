import { forwardRef, useState, useEffect, useId, useRef } from 'react';
import * as Popover from '@radix-ui/react-popover';
import styles from './TimePicker.module.css';

export interface TimePickerProps {
    label?: string;
    value?: string | null;
    defaultValue?: string | null;
    onChange?: (time: string | null) => void;
    placeholder?: string;
    error?: boolean;
    errorMessage?: string;
    helperText?: string;
    disabled?: boolean;
    className?: string;
    minuteInterval?: number; // e.g. 5, 10, 15, 30
}

const generateHours = () => {
    const list: string[] = [];
    for (let i = 0; i < 24; i++) {
        list.push(String(i).padStart(2, '0'));
    }
    return list;
};

const generateMinutes = (interval: number) => {
    const list: string[] = [];
    for (let i = 0; i < 60; i += interval) {
        list.push(String(i).padStart(2, '0'));
    }
    return list;
};

export const TimePicker = forwardRef<HTMLButtonElement, TimePickerProps>(
    ({
        label,
        value,
        defaultValue = null,
        onChange,
        placeholder = 'Select time',
        error = false,
        errorMessage,
        helperText,
        disabled = false,
        className = '',
        minuteInterval = 15,
        ...props
    }, ref) => {
        const [isOpen, setIsOpen] = useState(false);
        const [selectedTime, setSelectedTime] = useState<string | null>(defaultValue);

        const isControlled = value !== undefined;
        const activeTime = isControlled ? value : selectedTime;

        const hours = generateHours();
        const minutes = generateMinutes(minuteInterval);

        // Split active time to hour/minute
        const [selectedHour, setSelectedHour] = useState<string>('');
        const [selectedMinute, setSelectedMinute] = useState<string>('');

        useEffect(() => {
            if (activeTime && activeTime.includes(':')) {
                const [h, m] = activeTime.split(':');
                setSelectedHour(h);
                setSelectedMinute(m);
            } else {
                setSelectedHour('');
                setSelectedMinute('');
            }
        }, [activeTime]);

        const generatedId = useId();
        const triggerId = `timepicker-trigger-${generatedId}`;
        const errorId = errorMessage ? `timepicker-error-${generatedId}` : undefined;
        const helperId = helperText ? `timepicker-helper-${generatedId}` : undefined;
        const describedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined;

        // Column refs for auto-scrolling
        const hoursContainerRef = useRef<HTMLDivElement>(null);
        const minutesContainerRef = useRef<HTMLDivElement>(null);
        const hourOptionRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
        const minuteOptionRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

        // Auto scroll columns when popover opens
        useEffect(() => {
            if (isOpen) {
                setTimeout(() => {
                    if (selectedHour && hourOptionRefs.current[selectedHour] && hoursContainerRef.current) {
                        hourOptionRefs.current[selectedHour]?.scrollIntoView({ block: 'center' });
                    }
                    if (selectedMinute && minuteOptionRefs.current[selectedMinute] && minutesContainerRef.current) {
                        minuteOptionRefs.current[selectedMinute]?.scrollIntoView({ block: 'center' });
                    }
                }, 50);
            }
        }, [isOpen, selectedHour, selectedMinute]);

        const handleHourSelect = (hour: string) => {
            const currentMin = selectedMinute || '00';
            const newTime = `${hour}:${currentMin}`;
            if (!isControlled) {
                setSelectedTime(newTime);
                setSelectedHour(hour);
                setSelectedMinute(currentMin);
            }
            onChange?.(newTime);
        };

        const handleMinuteSelect = (minute: string) => {
            const currentHour = selectedHour || '12';
            const newTime = `${currentHour}:${minute}`;
            if (!isControlled) {
                setSelectedTime(newTime);
                setSelectedHour(currentHour);
                setSelectedMinute(minute);
            }
            onChange?.(newTime);
        };

        const handleClear = () => {
            if (disabled) return;
            if (!isControlled) {
                setSelectedTime(null);
                setSelectedHour('');
                setSelectedMinute('');
            }
            onChange?.(null);
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
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <polyline points="12 6 12 12 16 14"></polyline>
                                        </svg>
                                    </span>
                                    <span className={`
                                        ${styles.value} 
                                        ${!activeTime ? styles.placeholder : ''}
                                    `}>
                                        {activeTime || placeholder}
                                    </span>
                                </span>

                                <span className={styles.rightSection}>
                                    {activeTime && !disabled && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleClear();
                                            }}
                                            onPointerDown={(e) => e.stopPropagation()}
                                            className={styles.clearButton}
                                            aria-label="Clear time"
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
                                {/* Hours Column */}
                                <div className={styles.columnContainer}>
                                    <span className={styles.columnTitle}>HH</span>
                                    <div className={styles.scrollList} ref={hoursContainerRef}>
                                        {hours.map((h) => {
                                            const isSelected = selectedHour === h;
                                            return (
                                                <button
                                                    key={h}
                                                    ref={(el) => { hourOptionRefs.current[h] = el; }}
                                                    type="button"
                                                    onClick={() => handleHourSelect(h)}
                                                    className={`
                                                        ${styles.item}
                                                        ${isSelected ? styles.selected : ''}
                                                    `}
                                                >
                                                    {h}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className={styles.columnDivider} />

                                {/* Minutes Column */}
                                <div className={styles.columnContainer}>
                                    <span className={styles.columnTitle}>MM</span>
                                    <div className={styles.scrollList} ref={minutesContainerRef}>
                                        {minutes.map((m) => {
                                            const isSelected = selectedMinute === m;
                                            return (
                                                <button
                                                    key={m}
                                                    ref={(el) => { minuteOptionRefs.current[m] = el; }}
                                                    type="button"
                                                    onClick={() => handleMinuteSelect(m)}
                                                    className={`
                                                        ${styles.item}
                                                        ${isSelected ? styles.selected : ''}
                                                    `}
                                                >
                                                    {m}
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

TimePicker.displayName = 'TimePicker';
