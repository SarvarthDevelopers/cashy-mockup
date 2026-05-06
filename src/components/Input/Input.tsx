import React, { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import styles from './Input.module.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: boolean;
    errorMessage?: string;
    helperText?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, errorMessage, helperText, leftIcon, rightIcon, className, disabled, type = 'text', ...props }, ref) => {

        // Accessibility: Associate label and helper text with input
        const generatedId = React.useId();
        const inputId = props.id || generatedId;
        const helperId = helperText ? `${inputId}-helper` : undefined;
        const errorId = errorMessage ? `${inputId}-error` : undefined;
        const describedBy = [helperId, errorId].filter(Boolean).join(' ');

        return (
            <div className={`${styles.container} ${className || ''}`}>
                {label && (
                    <label htmlFor={inputId} className={styles.label}>
                        {label}
                    </label>
                )}

                <div className={`
          ${styles.inputWrapper} 
          ${error ? styles.error : ''} 
          ${disabled ? styles.disabled : ''}
        `}>
                    {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}

                    <input
                        ref={ref}
                        id={inputId}
                        type={type}
                        disabled={disabled}
                        aria-invalid={!!error}
                        aria-describedby={describedBy || undefined}
                        className={styles.input}
                        {...props}
                    />

                    {rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
                </div>

                {errorMessage && <span id={errorId} className={styles.errorMessage}>{errorMessage}</span>}
                {!errorMessage && helperText && <span id={helperId} className={styles.helperText}>{helperText}</span>}
            </div>
        );
    }
);

Input.displayName = 'Input';
