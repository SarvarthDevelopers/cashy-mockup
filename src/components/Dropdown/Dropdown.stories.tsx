import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within, fn, waitFor } from '@storybook/test';
import { useArgs } from '@storybook/preview-api';
import { Dropdown } from './Dropdown';

const meta: Meta<typeof Dropdown> = {
    title: 'Components/Dropdown',
    component: Dropdown,
    parameters: {
        layout: 'padded',
        design: {
            type: 'figma',
        },
    },
    decorators: [
        (Story) => (
            <div style={{ maxWidth: '320px' }}>
                <Story />
            </div>
        ),
    ],
    tags: [],
    argTypes: {
        onChange: { action: 'changed' },
        disabled: {
            control: 'boolean',
            description: 'Disable the dropdown',
        },
        error: {
            control: 'boolean',
            description: 'Show error state',
        },
    },
    render: function Render(args) {
        const [, updateArgs] = useArgs();
        const onChange = (newValue: string) => {
            // Check if uncontrolled vs controlled explicitly for story panel reactivity
            if (args.value !== undefined) {
               updateArgs({ value: newValue });
            }
            args.onChange?.(newValue);
        };
        return <Dropdown {...args} onChange={onChange} />;
    },
};

export default meta;
type Story = StoryObj<typeof Dropdown>;

const defaultOptions = [
    { label: 'Cashy AT', value: 'at' },
    { label: 'Cashy DE', value: 'de' },
];

export const Default: Story = {
    args: {
        placeholder: 'Company',
        options: defaultOptions,
    },
};

export const Focused: Story = {
    args: {
        placeholder: 'Company',
        options: defaultOptions,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const trigger = canvas.getByRole('button', { name: /company/i });
        await userEvent.click(trigger);
    }
};

export const Filled: Story = {
    args: {
        placeholder: 'Company',
        options: defaultOptions,
        value: 'at',
    },
};

export const Disabled: Story = {
    args: {
        placeholder: 'Company',
        options: defaultOptions,
        disabled: true,
    },
};

export const WithLabelAndHelperText: Story = {
    args: {
        label: 'Select Region',
        placeholder: 'Company',
        options: defaultOptions,
        helperText: 'Please select a company region to proceed.',
    },
};

export const ErrorState: Story = {
    args: {
        label: 'Select Region',
        placeholder: 'Company',
        options: defaultOptions,
        error: true,
        errorMessage: 'Region is required.',
    },
};

export const InteractiveSelection: Story = {
     args: {
        placeholder: 'Company',
        options: defaultOptions,
        onChange: fn(),
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const trigger = canvas.getByRole('button', { name: /company/i });

        // Open dropdown
        await userEvent.click(trigger);

        // Find options in the listbox
        const listbox = canvas.getByRole('listbox');
        const optionsList = within(listbox).getAllByRole('option');

        // Click the first option
        await userEvent.click(optionsList[0]);

        // Verify selection
        await waitFor(() => expect(args.onChange).toHaveBeenCalledWith('at'));
    }
}
