import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Input, type InputProps } from './Input';

// Icon components
const SearchIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const DollarIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"></line>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
);

// Extend InputProps with Storybook-only args
type StoryArgs = InputProps & {
    showLeftIcon?: boolean;
    showRightIcon?: boolean;
};

const meta: Meta<StoryArgs> = {
    title: 'Components/Input',
    component: Input,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        type: {
            control: 'select',
            options: ['text', 'password', 'email', 'number', 'search'],
        },
        error: { control: 'boolean' },
        disabled: { control: 'boolean' },
        showLeftIcon: {
            control: 'boolean',
            description: 'Show left icon',
            table: { category: 'Icons' }
        },
        showRightIcon: {
            control: 'boolean',
            description: 'Show right icon',
            table: { category: 'Icons' }
        },
        leftIcon: { table: { disable: true } },
        rightIcon: { table: { disable: true } },
    },
    decorators: [
        (Story) => (
            <div style={{ width: '100%', maxWidth: '600px' }}>
                <Story />
            </div>
        ),
    ],
    render: ({ showLeftIcon, showRightIcon, ...args }) => (
        <Input
            {...args}
            leftIcon={showLeftIcon ? <SearchIcon /> : undefined}
            rightIcon={showRightIcon ? <DollarIcon /> : undefined}
        />
    ),
};

export default meta;
type Story = StoryObj<StoryArgs>;

// --- Base Input ---
export const Base: Story = {
    args: {
        label: 'Email Address',
        placeholder: 'Enter your email',
        type: 'email',
        helperText: 'We will not share your email.',
        showLeftIcon: false,
        showRightIcon: false,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByPlaceholderText('Enter your email');

        // Test typing in the input
        await userEvent.type(input, 'test@example.com', { delay: 100 });
        await expect(input).toHaveValue('test@example.com');
    },
};

// --- Search Input ---
export const Search: Story = {
    args: {
        label: 'Search',
        placeholder: 'Search for items...',
        type: 'search',
        showLeftIcon: true,
        showRightIcon: false,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByPlaceholderText('Search for items...');

        // Test search functionality
        await userEvent.type(input, 'laptop', { delay: 100 });
        await expect(input).toHaveValue('laptop');
    },
};

// --- Number Input ---
export const Number: Story = {
    args: {
        label: 'Quantity',
        placeholder: '0',
        type: 'number',
        min: 0,
        max: 100,
        showLeftIcon: false,
        showRightIcon: false,
    },
};

// --- Error State ---
export const WithError: Story = {
    args: {
        label: 'Username',
        defaultValue: 'invalid_user',
        error: true,
        errorMessage: 'This username is already taken.',
    },
};

// --- Disabled State ---
export const Disabled: Story = {
    args: {
        label: 'Disabled Input',
        placeholder: 'Cannot type here',
        disabled: true,
    },
};
