import React from 'react';

export const TabsContext = React.createContext<{
    value: string;
    onValueChange: (value: string) => void;
    variant: 'underline' | 'pill' | 'ghost' | 'segment' | 'underline-thick' | 'stepper';
    tabValues?: string[];
} | null>(null);
