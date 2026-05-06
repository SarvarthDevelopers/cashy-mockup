import React, { useId, useEffect, useRef } from 'react';
import './Checkbox.css';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    /**
     * Label to display
     */
    label?: React.ReactNode;
    /**
     * Helper description
     */
    description?: string;
    /**
     * Indeterminate state (visual only, acts as checked but with dash)
     */
    indeterminate?: boolean;
    /**
     * Size of the checkbox
     * @default 'medium'
     */
    size?: 'small' | 'medium' | 'large';
}

/**
 * Checkbox component for binary or indeterminate choices.
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({
    className = '',
    checked,
    defaultChecked, // React handles this usually, but we pass it down
    indeterminate = false,
    label,
    description,
    disabled = false,
    size = 'medium',
    onChange,
    id,
    ...props
}, ref) => {
    const generatedId = useId();
    const inputId = id || `checkbox-${generatedId}`;
    const descriptionId = description ? `checkbox-desc-${generatedId}` : undefined;
    const internalRef = useRef<HTMLInputElement>(null);

    // Combine forwarded ref and internal ref
    React.useImperativeHandle(ref, () => internalRef.current as HTMLInputElement);

    // Handle indeterminate state via DOM property
    useEffect(() => {
        if (internalRef.current) {
            internalRef.current.indeterminate = indeterminate;
        }
    }, [indeterminate]);

    const baseClass = 'checkbox';
    const sizeClass = `checkbox--size-${size}`;
    const disabledClass = disabled ? 'checkbox--disabled' : '';

    return (
        <label
            htmlFor={inputId}
            className={[baseClass, sizeClass, disabledClass, className].filter(Boolean).join(' ')}
        >
            <div className="checkbox__control-container">
                <input
                    type="checkbox"
                    id={inputId}
                    ref={internalRef}
                    checked={checked}
                    defaultChecked={defaultChecked}
                    disabled={disabled}
                    onChange={onChange}
                    aria-describedby={descriptionId}
                    className="checkbox__input"
                    {...props}
                />
                <span className="checkbox__control">
                    {/* Icon for Checked State (Checkmark) */}
                    <svg
                        className="checkbox__icon checkbox__icon--checked"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                    >
                        <path
                            d="M13.3334 4L6.00008 11.3333L2.66675 8"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>

                    {/* Icon for Indeterminate State (Dash) */}
                    <svg
                        className="checkbox__icon checkbox__icon--indeterminate"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                    >
                        <path
                            d="M3.33325 8H12.6666"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </span>
            </div>

            {(label || description) && (
                <div className="checkbox__content">
                    {label && <span className="checkbox__label-text">{label}</span>}
                    {description && <span id={descriptionId} className="checkbox__description">{description}</span>}
                </div>
            )}
        </label>
    );
});

Checkbox.displayName = 'Checkbox';
