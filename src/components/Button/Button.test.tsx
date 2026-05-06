import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
    it('renders with children text', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('applies the correct variant class', () => {
        render(<Button variant="secondary">Secondary</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('button--variant-secondary');
    });

    it('applies the correct size class', () => {
        render(<Button size="large">Large</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('button--size-large');
    });

    it('handles click events', async () => {
        const user = userEvent.setup();
        let clicked = false;
        const handleClick = () => { clicked = true; };

        render(<Button onClick={handleClick}>Click</Button>);
        await user.click(screen.getByRole('button'));

        expect(clicked).toBe(true);
    });

    it('is disabled when disabled prop is true', () => {
        render(<Button disabled>Disabled</Button>);
        expect(screen.getByRole('button')).toBeDisabled();
    });

    it('shows loading state', () => {
        render(<Button isLoading>Loading</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('button--loading');
        expect(button).toBeDisabled();
    });

    it('renders with left icon', () => {
        const icon = <span data-testid="icon">→</span>;
        render(<Button iconLeft={icon}>With Icon</Button>);
        expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('renders icon-only button with aria-label', () => {
        const icon = <span data-testid="icon">✓</span>;
        render(<Button iconLeft={icon} aria-label="Confirm" />);

        const button = screen.getByRole('button', { name: /confirm/i });
        expect(button).toHaveClass('button--has-icon-only');
        expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('applies custom className', () => {
        render(<Button className="custom-class">Custom</Button>);
        expect(screen.getByRole('button')).toHaveClass('custom-class');
    });
});
