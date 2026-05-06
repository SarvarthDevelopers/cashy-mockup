import React from 'react';
import './Button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /**
     * Visual style of the button
     */
    variant?: 'primary' | 'secondary' | 'tertiary' | 'danger-bold' | 'danger-subtle';
    /**
     * How large should the button be?
     */
    size?: 'small' | 'medium' | 'large';
    /**
     * Icon element to display on the left
     */
    iconLeft?: React.ReactNode;
    /**
     * Icon element to display on the right
     */
    iconRight?: React.ReactNode;
    /**
     * Is the button in a loading state?
     */
    isLoading?: boolean;
}

/**
 * Primary UI component for user interaction
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
    variant = 'primary',
    size = 'medium',
    iconLeft,
    iconRight,
    isLoading = false,
    className = '',
    children,
    disabled,
    ...props
}, ref) => {
    const baseClass = 'button';
    const variantClass = `button--variant-${variant}`;
    const sizeClass = `button--size-${size}`;
    const loadingClass = isLoading ? 'button--loading' : '';
    const iconOnlyClass = (iconLeft || iconRight) && !children ? 'button--has-icon-only' : '';

    return (
        <button
            type="button"
            className={[baseClass, variantClass, sizeClass, loadingClass, iconOnlyClass, className].filter(Boolean).join(' ')}
            disabled={disabled || isLoading}
            ref={ref}
            {...props}
        >
            {isLoading && <span className="button__spinner" aria-hidden="true" />}
            {!isLoading && iconLeft}
            {children}
            {!isLoading && iconRight}
        </button>
    );
});

Button.displayName = 'Button';
