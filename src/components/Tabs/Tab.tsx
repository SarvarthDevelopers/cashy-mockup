import React, { useContext } from 'react';
import { TabsContext } from './TabsContext';

export interface TabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /**
     * Unique value for the tab
     */
    value: string;
    /**
     * Optional icon to display
     */
    icon?: React.ReactNode;
    /**
     * Optional subtitle to display below the main label
     */
    subtitle?: string;
}

export const Tab = React.forwardRef<HTMLButtonElement, TabProps>(({
    value,
    icon,
    subtitle,
    children,
    className = '',
    disabled,
    ...props
}, ref) => {
    const context = useContext(TabsContext);

    if (!context) {
        throw new Error('Tab must be used within a Tabs component');
    }

    const { value: selectedValue, onValueChange, variant, tabValues } = context;
    const isSelected = selectedValue === value;
    
    // Logic for stepper variant
    const currentIndex = tabValues?.indexOf(value) ?? -1;
    const activeIndex = tabValues?.indexOf(selectedValue) ?? -1;
    const isCompleted = activeIndex > -1 && currentIndex > -1 && currentIndex < activeIndex;

    const getStepperClass = () => {
        if (variant !== 'stepper') return '';
        if (isSelected) return 'tab--stepper-active';
        if (isCompleted) return 'tab--stepper-completed';
        return 'tab--stepper-pending';
    };

    const handleTabClick = () => {
        if (disabled) return;
        // Optional: you can prevent completing/navigating past pending steps here if desired
        // but typically tabs allow jumping if not disabled. We'll leave it simple.
        onValueChange(value);
    };

    return (
        <button
            type="button"
            role="tab"
            aria-selected={isSelected}
            disabled={disabled}
            className={`tab ${isSelected ? 'tab--selected' : ''} ${getStepperClass()} ${className}`}
            onClick={handleTabClick}
            ref={ref}
            {...props}
        >
            {icon && <span className="tab__icon">{icon}</span>}
            <span className="tab__content">
                <span className="tab__label">{children}</span>
                {subtitle && <span className="tab__subtitle">{subtitle}</span>}
            </span>
        </button>
    );
});

Tab.displayName = 'Tab';
