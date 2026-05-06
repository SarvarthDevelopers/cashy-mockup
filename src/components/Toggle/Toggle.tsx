import React, {  useId } from 'react';
import './Toggle.css';

export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    /**
     * Label text to display alongside the toggle
     */
    label?: string;
    /**
     * Helper text or description
     */
    description?: string;
    /**
     * Position of the label relative to the toggle
     * @default 'right'
     */
    labelPosition?: 'left' | 'right';
    /**
     * Size of the toggle
     * @default 'medium'
     */
    size?: 'small' | 'medium' | 'large';
}

/**
 * Toggle component for switching between two states.
 * 
 * Uses semantic tokens for styling:
 * - Active: --background-brand-solid
 * - Inactive: --background-tertiary
 */
export const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(({
    className = '',
    checked,
    defaultChecked,
    disabled = false,
    label,
    description,
    labelPosition = 'right',
    size = 'medium',
    onChange,
    id,
    ...props
}, ref) => {
    const generatedId = useId();
    const inputId = id || `toggle-${generatedId}`;
    const descriptionId = description ? `toggle-desc-${generatedId}` : undefined;

    const baseClass = 'toggle';
    const sizeClass = `toggle--size-${size}`;
    const disabledClass = disabled ? 'toggle--disabled' : '';
    const labelPosClass = `toggle--label-${labelPosition}`;

    return (
        <label 
            htmlFor={inputId} 
            className={[baseClass, sizeClass, disabledClass, labelPosClass, className].filter(Boolean).join(' ')}
        >
             {label && labelPosition === 'left' && (
                <div className="toggle__content">
                    <span className="toggle__label-text">{label}</span>
                    {description && <span id={descriptionId} className="toggle__description">{description}</span>}
                </div>
            )}
            
            <div className="toggle__control">
                <input
                    type="checkbox"
                    className="toggle__input"
                    id={inputId}
                    ref={ref}
                    checked={checked}
                    defaultChecked={defaultChecked}
                    disabled={disabled}
                    onChange={onChange}
                    aria-describedby={descriptionId}
                    {...props}
                />
                <span className="toggle__track">
                    <span className="toggle__handle" />
                </span>
            </div>

            {label && labelPosition === 'right' && (
                <div className="toggle__content">
                    <span className="toggle__label-text">{label}</span>
                    {description && <span id={descriptionId} className="toggle__description">{description}</span>}
                </div>
            )}
        </label>
    );
});

Toggle.displayName = 'Toggle';
