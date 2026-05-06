import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Input } from './Input';

describe('Input', () => {
    it('renders with label', () => {
        render(<Input label="Email" placeholder="Enter email" />);
        expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('renders with placeholder', () => {
        render(<Input label="Email" placeholder="Enter email" />);
        expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
    });

    it('handles user input', async () => {
        const user = userEvent.setup();
        render(<Input label="Email" placeholder="Enter email" />);
        const input = screen.getByPlaceholderText('Enter email');

        await user.type(input, 'test@example.com');
        expect(input).toHaveValue('test@example.com');
    });

    it('shows error message when error prop is true', () => {
        render(
            <Input
                label="Email"
                error={true}
                errorMessage="Invalid email"
            />
        );
        expect(screen.getByText('Invalid email')).toBeInTheDocument();
    });

    it('shows helper text when provided', () => {
        render(
            <Input
                label="Email"
                helperText="We will not share your email"
            />
        );
        expect(screen.getByText('We will not share your email')).toBeInTheDocument();
    });

    it('is disabled when disabled prop is true', () => {
        render(<Input label="Email" placeholder="Enter email" disabled />);
        const input = screen.getByPlaceholderText('Enter email');
        expect(input).toBeDisabled();
    });

    it('renders with left icon', () => {
        const LeftIcon = () => <span data-testid="left-icon">🔍</span>;
        render(<Input label="Search" leftIcon={<LeftIcon />} />);
        expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('renders with right icon', () => {
        const RightIcon = () => <span data-testid="right-icon">💰</span>;
        render(<Input label="Amount" rightIcon={<RightIcon />} />);
        expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('calls onChange when input value changes', async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();
        render(<Input label="Email" onChange={handleChange} />);
        const input = screen.getByRole('textbox');

        await user.type(input, 'a');
        expect(handleChange).toHaveBeenCalled();
    });
});
