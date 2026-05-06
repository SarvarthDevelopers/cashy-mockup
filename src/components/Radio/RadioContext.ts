import { createContext, useContext } from 'react';

export interface RadioContextValue {
    name: string;
    value?: string | number;
    onChange?: (value: string | number) => void;
    disabled?: boolean;
    size?: 'small' | 'medium' | 'large';
}

export const RadioContext = createContext<RadioContextValue | null>(null);

export const useRadioContext = () => useContext(RadioContext);
