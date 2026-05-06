import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox } from './Checkbox';
import { describe, it, expect, vi } from 'vitest';

describe('Checkbox Component', () => {
    it('renders with a label', () => {
        render(<Checkbox label="Test Checkbox" />);
        expect(screen.getByLabelText('Test Checkbox')).toBeInTheDocument();
    });

    it('toggles state on click', () => {
        const handleChange = vi.fn();
        render(<Checkbox label="Check Me" onChange={handleChange} />);

        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).not.toBeChecked();

        fireEvent.click(checkbox);
        expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('respects defaultChecked', () => {
        render(<Checkbox label="Checked" defaultChecked />);
        expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('sets indeterminate property', () => {
        render(<Checkbox label="Indeterminate" readOnly indeterminate />);
        // Indeterminate state is a DOM property, not semantic attribute for aria-checked='mixed' 
        // effectively, but visual check:
        const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
        expect(checkbox.indeterminate).toBe(true);
    });

    it('is disabled when the disabled prop is passed', () => {
        render(<Checkbox label="Disabled" disabled />);
        expect(screen.getByRole('checkbox')).toBeDisabled();
    });

    it('renders description when provided', () => {
        render(<Checkbox label="Label" description="Desc" />);
        expect(screen.getByText('Desc')).toBeInTheDocument();
    });
});
