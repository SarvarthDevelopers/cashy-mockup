import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './Checkbox';

const meta = {
    title: 'Components/Checkbox',
    component: Checkbox,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        disabled: { control: 'boolean' },
        indeterminate: { control: 'boolean' },
        label: { control: 'text' },
        description: { control: 'text' },
        size: {
            control: { type: 'select' },
            options: ['small', 'medium', 'large'],
        },
    },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        label: 'Accept terms and conditions',
    },
};

export const Checked: Story = {
    args: {
        label: 'Subscribe to newsletter',
        defaultChecked: true,
    },
};

export const Indeterminate: Story = {
    args: {
        label: 'Select all (some selected)',
        indeterminate: true,
        checked: false,
    },
};

export const WithDescription: Story = {
    args: {
        label: 'Notifications',
        description: 'Receive email updates about your account activity.',
        defaultChecked: true,
    },
};

export const Sizes: Story = {
    parameters: {
        controls: { hideNoControlsWarning: true },
    },
    argTypes: {
        size: { table: { disable: true } },
        label: { table: { disable: true } },
        description: { table: { disable: true } },
        disabled: { table: { disable: true } },
        indeterminate: { table: { disable: true } },
    },
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Checkbox size="small" label="Small Checkbox" />
            <Checkbox size="medium" label="Medium Checkbox" defaultChecked />
            <Checkbox size="large" label="Large Checkbox" indeterminate />
        </div>
    ),
};

export const Disabled: Story = {
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Checkbox label="Disabled Unchecked" disabled />
            <Checkbox label="Disabled Checked" disabled defaultChecked />
            <Checkbox label="Disabled Indeterminate" disabled indeterminate />
        </div>
    ),
};
