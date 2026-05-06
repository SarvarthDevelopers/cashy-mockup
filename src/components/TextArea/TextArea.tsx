import React, { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import styles from './TextArea.module.css';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: boolean;
    errorMessage?: string;
    helperText?: string;
    resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
    ({ label, error, errorMessage, helperText, resize = 'vertical', className, disabled, style, ...props }, ref) => {

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
                    <textarea
                        ref={ref}
                        id={inputId}
                        disabled={disabled}
                        aria-invalid={!!error}
                        aria-describedby={describedBy || undefined}
                        className={styles.textarea}
                        style={{ resize, ...style }}
                        {...props}
                    />
                </div>

                {errorMessage && <span id={errorId} className={styles.errorMessage}>{errorMessage}</span>}
                {!errorMessage && helperText && <span id={helperId} className={styles.helperText}>{helperText}</span>}
            </div>
        );
    }
);

TextArea.displayName = 'TextArea';
