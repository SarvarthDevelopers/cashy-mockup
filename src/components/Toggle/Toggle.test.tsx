import { render, screen, fireEvent } from '@testing-library/react';
import { Toggle } from './Toggle';
import { describe, it, expect, vi } from 'vitest';

describe('Toggle Component', () => {
    it('renders with a label', () => {
        render(<Toggle label="Test Toggle" />);
        expect(screen.getByLabelText('Test Toggle')).toBeInTheDocument();
    });

    it('toggles state on click', () => {
        const handleChange = vi.fn();
        render(<Toggle label="Toggle Me" onChange={handleChange} />);

        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).not.toBeChecked();

        fireEvent.click(checkbox);
        expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('respects defaultChecked', () => {
        render(<Toggle label="Checked" defaultChecked />);
        expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('is disabled when the disabled prop is passed', () => {
        render(<Toggle label="Disabled" disabled />);
        expect(screen.getByRole('checkbox')).toBeDisabled();
    });

    it('renders description when provided', () => {
        render(<Toggle label="Label" description="Desc" />);
        expect(screen.getByText('Desc')).toBeInTheDocument();
    });
});
