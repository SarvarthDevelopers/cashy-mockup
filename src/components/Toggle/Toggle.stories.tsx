import type { Meta, StoryObj } from '@storybook/react';
import { Toggle } from './Toggle';

const meta = {
    title: 'Components/Toggle',
    component: Toggle,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        disabled: { control: 'boolean' },
        label: { control: 'text' },
        description: { control: 'text' },
        size: {
            control: { type: 'select' },
            options: ['small', 'medium', 'large'],
        },
        labelPosition: {
            control: { type: 'radio' },
            options: ['left', 'right'],
        },
    },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        label: 'Enable notifications',
    },
};

export const Checked: Story = {
    args: {
        label: 'Dark mode',
        checked: true, // Controlled for story, but usually managed by state or defaultChecked
        onChange: () => { }, // No-op for story
    },
};

export const WithDescription: Story = {
    args: {
        label: 'Auto-save',
        description: 'Changes will be saved automatically.',
        defaultChecked: true,
    },
};

export const Sizes: Story = {
    render: (args) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Toggle {...args} size="small" label="Small Toggle" />
            <Toggle {...args} size="medium" label="Medium Toggle" defaultChecked />
            <Toggle {...args} size="large" label="Large Toggle" />
        </div>
    ),
};

export const LabelPosition: Story = {
    render: (args) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '300px' }}>
            <Toggle {...args} labelPosition="right" label="Right Label" defaultChecked />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Toggle {...args} labelPosition="left" label="Left Label" />
            </div>
        </div>
    ),
};

export const Disabled: Story = {
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Toggle label="Disabled Off" disabled />
            <Toggle label="Disabled On" disabled defaultChecked />
        </div>
    ),
};
