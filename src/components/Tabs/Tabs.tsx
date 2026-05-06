import React, { useState } from 'react';
import './Tabs.css';
import { TabsContext } from './TabsContext';

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Controlled value of the active tab
     */
    value?: string;
    /**
     * Default value for uncontrolled state
     */
    defaultValue?: string;
    /**
     * Callback when value changes
     */
    onValueChange?: (value: string) => void;
    /**
     * Visual variant of the tabs
     */
    variant?: 'underline' | 'pill' | 'ghost' | 'segment' | 'underline-thick' | 'stepper';
    /**
     * Whether tabs should take up full width
     */
    fullWidth?: boolean;
    /**
     * Tab items
     */
    children: React.ReactNode;
}



export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(({
    value: controlledValue,
    defaultValue,
    onValueChange,
    variant = 'underline',
    fullWidth = false,
    className = '',
    children,
    ...props
}, ref) => {
    const [statsValue, setLocalValue] = useState(defaultValue || '');
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : statsValue;

    const handleValueChange = (newValue: string) => {
        if (!isControlled) {
            setLocalValue(newValue);
        }
        onValueChange?.(newValue);
    };

    // Set initial value if not controlled and defaultValue is not provided, 
    // strictly speaking we might wait for children to mount to pick first, 
    // but standard practice is purely controlled or default. 
    // If no default and no value, nothing is selected.

    const tabValues = React.Children.toArray(children)
        .filter(React.isValidElement)
        .map(child => (child as React.ReactElement<{ value: string }>).props.value);

    const renderChildren = () => {
        if (variant !== 'stepper') return children;

        const childrenArray = React.Children.toArray(children).filter(React.isValidElement);
        return childrenArray.map((child, index) => (
            <React.Fragment key={(child as React.ReactElement<{ value?: string }>).props.value || index}>
                {child}
                {index < childrenArray.length - 1 && (
                    <div className="tab__stepper-separator" aria-hidden="true">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5.25 10.5L8.75 7L5.25 3.5" stroke="var(--text-placeholder, #8A95A6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                )}
            </React.Fragment>
        ));
    };

    return (
        <TabsContext.Provider value={{ value: value || '', onValueChange: handleValueChange, variant, tabValues }}>
            <div
                className={`tabs tabs--${variant} ${fullWidth ? 'tabs--full-width' : ''} ${className}`}
                ref={ref}
                {...props}
            >
                {renderChildren()}
            </div>
        </TabsContext.Provider>
    );
});

Tabs.displayName = 'Tabs';
