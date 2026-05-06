import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within, fn } from '@storybook/test';
import { Button } from './Button';

// Mock icons for stories
const IconPlaceholder = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 0L16 16H0L8 0Z" />
    </svg>
);

const meta: Meta<typeof Button> = {
    title: 'Components/Button',
    component: Button,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/design/SgNdO2YmHiOGzsGwy1ZHWN/CASHY-Design-System-Kit?node-id=21-3762&t=JL116qCGQBMLHtwl-4',
        },
    },
    tags: [],
    argTypes: {
        variant: {
            control: 'select',
            options: ['primary', 'secondary', 'tertiary', 'danger-bold', 'danger-subtle'],
            description: 'Visual style of the button',
        },
        size: {
            control: 'radio',
            options: ['small', 'medium', 'large'],
            description: 'Size of the button',
        },
        iconLeft: {
            control: 'boolean',
            mapping: {
                true: <IconPlaceholder />,
                false: undefined,
            },
            description: 'Show icon on the left',
        },
        iconRight: {
            control: 'boolean',
            mapping: {
                true: <IconPlaceholder />,
                false: undefined,
            },
            description: 'Show icon on the right',
        },
        disabled: {
            control: 'boolean',
            description: 'Disable the button',
        },
        isLoading: {
            control: 'boolean',
            description: 'Show loading state',
        },
        onClick: { action: 'clicked' },
    },
};

export default meta;
type Story = StoryObj<typeof Button>;

// Default story with all controls
export const Default: Story = {
    args: {
        variant: 'primary',
        children: 'Button',
    },
};

// Semantic variants
export const Primary: Story = {
    args: {
        variant: 'primary',
        children: 'Primary',
        onClick: fn(),
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const button = canvas.getByRole('button');

        // Test button click
        await userEvent.click(button);
        await expect(args.onClick).toHaveBeenCalled();
    },
};

export const Secondary: Story = {
    args: {
        variant: 'secondary',
        children: 'Secondary',
    },
};

export const Tertiary: Story = {
    args: {
        variant: 'tertiary',
        children: 'Tertiary',
    },
};

export const DangerBold: Story = {
    args: {
        variant: 'danger-bold',
        children: 'Delete',
    },
};

export const DangerSubtle: Story = {
    args: {
        variant: 'danger-subtle',
        children: 'Remove',
    },
};

// Behavioral variants
export const Loading: Story = {
    args: {
        children: 'Saving...',
        isLoading: true,
    },
};

export const Disabled: Story = {
    args: {
        children: 'Disabled',
        disabled: true,
    },
};

// Icon Only (important for accessibility)
export const IconOnly: Story = {
    args: {
        variant: 'secondary',
        iconLeft: <IconPlaceholder />,
        'aria-label': 'Edit',
    },
    parameters: {
        docs: {
            description: {
                story: 'Icon-only buttons require an `aria-label` for accessibility.',
            },
        },
    },
};

// Documentation examples
export const LongText: Story = {
    args: {
        children: 'Button with very long text that might wrap',
    },
    parameters: {
        docs: {
            description: {
                story: 'Buttons handle long text gracefully with proper padding.',
            },
        },
    },
};
