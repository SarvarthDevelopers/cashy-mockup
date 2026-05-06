import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TextArea } from './TextArea';

describe('TextArea', () => {
    it('renders with label', () => {
        render(<TextArea label="Description" placeholder="Enter description" />);
        expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('renders with placeholder', () => {
        render(<TextArea label="Description" placeholder="Enter description" />);
        expect(screen.getByPlaceholderText('Enter description')).toBeInTheDocument();
    });

    it('handles user input', async () => {
        const user = userEvent.setup();
        render(<TextArea label="Description" placeholder="Enter description" />);
        const textarea = screen.getByPlaceholderText('Enter description');

        await user.type(textarea, 'This is a test description');
        expect(textarea).toHaveValue('This is a test description');
    });

    it('shows error message when error prop is true', () => {
        render(
            <TextArea
                label="Description"
                error={true}
                errorMessage="Description is required"
            />
        );
        expect(screen.getByText('Description is required')).toBeInTheDocument();
    });

    it('shows helper text when provided', () => {
        render(
            <TextArea
                label="Description"
                helperText="Max 500 characters"
            />
        );
        expect(screen.getByText('Max 500 characters')).toBeInTheDocument();
    });

    it('is disabled when disabled prop is true', () => {
        render(<TextArea label="Description" placeholder="Enter description" disabled />);
        const textarea = screen.getByPlaceholderText('Enter description');
        expect(textarea).toBeDisabled();
    });

    it('respects rows prop', () => {
        render(<TextArea label="Description" rows={10} />);
        const textarea = screen.getByRole('textbox');
        expect(textarea).toHaveAttribute('rows', '10');
    });

    it('calls onChange when textarea value changes', async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();
        render(<TextArea label="Description" onChange={handleChange} />);
        const textarea = screen.getByRole('textbox');

        await user.type(textarea, 'a');
        expect(handleChange).toHaveBeenCalled();
    });
});
