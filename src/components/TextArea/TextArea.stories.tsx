import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { TextArea } from './TextArea';

const meta: Meta<typeof TextArea> = {
    title: 'Components/TextArea',
    component: TextArea,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        resize: {
            control: 'select',
            options: ['none', 'vertical', 'horizontal', 'both'],
        },
        error: { control: 'boolean' },
        disabled: { control: 'boolean' },
        rows: { control: 'number' },
    },
    decorators: [
        (Story) => (
            <div style={{ width: '100%', maxWidth: '600px' }}>
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof TextArea>;

// --- Default TextArea ---
export const Default: Story = {
    args: {
        label: 'Description',
        placeholder: 'Enter a detailed description...',
        rows: 4,
        helperText: 'Max 500 characters',
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const textarea = canvas.getByPlaceholderText('Enter a detailed description...');

        // Test typing in textarea
        await userEvent.type(textarea, 'This is a test description for the textarea component.', { delay: 50 });
        await expect(textarea).toHaveValue('This is a test description for the textarea component.');
    },
};

// --- Error State ---
export const WithError: Story = {
    args: {
        label: 'Feedback',
        error: true,
        errorMessage: 'Feedback is required.',
    },
};

// --- Disabled State ---
export const Disabled: Story = {
    args: {
        label: 'Read Only Notes',
        value: 'This content cannot be edited.',
        disabled: true,
    },
};
