import { render, screen, fireEvent } from '@testing-library/react';
import { Radio } from './Radio';
import { RadioGroup } from './RadioGroup';
import { describe, it, expect, vi } from 'vitest';

describe('Radio and RadioGroup', () => {
    it('renders radio options', () => {
        render(
            <RadioGroup name="test">
                <Radio value="1" label="Option 1" />
                <Radio value="2" label="Option 2" />
            </RadioGroup>
        );
        expect(screen.getByLabelText('Option 1')).toBeInTheDocument();
        expect(screen.getByLabelText('Option 2')).toBeInTheDocument();
    });

    it('handles interactions via group', () => {
        const handleChange = vi.fn();
        render(
            <RadioGroup name="test" onChange={handleChange}>
                <Radio value="1" label="Option 1" />
                <Radio value="2" label="Option 2" />
            </RadioGroup>
        );

        fireEvent.click(screen.getByLabelText('Option 2'));
        expect(handleChange).toHaveBeenCalledWith('2');
    });

    it('respects defaultValue', () => {
        render(
            <RadioGroup name="test" defaultValue="2">
                <Radio value="1" label="Option 1" />
                <Radio value="2" label="Option 2" />
            </RadioGroup>
        );
        expect(screen.getByLabelText('Option 2')).toBeChecked();
        expect(screen.getByLabelText('Option 1')).not.toBeChecked();
    });

    it('disables all radios when group is disabled', () => {
        render(
            <RadioGroup name="test" disabled>
                <Radio value="1" label="Option 1" />
                <Radio value="2" label="Option 2" />
            </RadioGroup>
        );
        expect(screen.getByLabelText('Option 1')).toBeDisabled();
        expect(screen.getByLabelText('Option 2')).toBeDisabled();
    });

    it('renders descriptions', () => {
        render(
            <Radio value="1" label="Option 1" description="Desc 1" />
        );
        expect(screen.getByText('Desc 1')).toBeInTheDocument();
    });
});
