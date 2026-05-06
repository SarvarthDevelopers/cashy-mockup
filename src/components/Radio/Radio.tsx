import React, { useId } from 'react';
import { useRadioContext } from './RadioContext';
import './Radio.css';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'value' | 'onChange'> {
    /**
     * Value of this radio option
     */
    value: string | number;
    /**
     * Label to display
     */
    label?: React.ReactNode;
    /**
     * Helper description
     */
    description?: string;
    /**
     * Size (overrides group size)
     */
    size?: 'small' | 'medium' | 'large';
    /**
     * Callback when this specific radio is changed
     */
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Radio button component.
 */
export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(({
    className = '',
    value,
    label,
    description,
    disabled,
    size,
    onChange,
    id,
    checked, // Allow individual controlled override
    ...props
}, ref) => {
    const context = useRadioContext();
    const generatedId = useId();
    const inputId = id || `radio-${generatedId}`;
    const descriptionId = description ? `radio-desc-${generatedId}` : undefined;

    // Merge props with context
    const isChecked = typeof checked !== 'undefined' ? checked : (context?.value === value);
    const isDisabled = disabled || context?.disabled;
    const finalSize = size || context?.size || 'medium';
    const finalName = context?.name || props.name;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isDisabled) return;

        if (onChange) onChange(e);
        if (context?.onChange) context.onChange(value);
    };

    const baseClass = 'radio';
    const sizeClass = `radio--size-${finalSize}`;
    const disabledClass = isDisabled ? 'radio--disabled' : '';

    return (
        <label
            htmlFor={inputId}
            className={[baseClass, sizeClass, disabledClass, className].filter(Boolean).join(' ')}
        >
            <div className="radio__control-container">
                <input
                    type="radio"
                    id={inputId}
                    ref={ref}
                    name={finalName}
                    value={value}
                    checked={isChecked}
                    disabled={isDisabled}
                    onChange={handleChange}
                    aria-describedby={descriptionId}
                    className="radio__input"
                    {...props}
                />
                <span className="radio__control">
                    <span className="radio__indicator" />
                </span>
            </div>

            {(label || description) && (
                <div className="radio__content">
                    {label && <span className="radio__label-text">{label}</span>}
                    {description && <span id={descriptionId} className="radio__description">{description}</span>}
                </div>
            )}
        </label>
    );
});

Radio.displayName = 'Radio';
