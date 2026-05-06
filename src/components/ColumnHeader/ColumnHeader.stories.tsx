import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within, fn } from '@storybook/test';
import { ColumnHeader } from './ColumnHeader';

const meta: Meta<typeof ColumnHeader> = {
    title: 'Components/ColumnHeader',
    component: ColumnHeader,
    parameters: {
        layout: 'padded',
        design: {
            type: 'figma',
        },
    },
    tags: [],
    argTypes: {
        variant: {
            control: 'radio',
            options: ['admin', 'staff'],
            description: 'Variant determining visible actions',
        },
        count: {
            control: 'number',
            description: 'Item count inside the column',
        },
        title: {
            control: 'text',
            description: 'Name of the column',
        },
        onConfigClick: { action: 'config clicked' },
        onAddClick: { action: 'add clicked' },
    },
    decorators: [
        (Story) => (
            <div style={{ width: '264px' }}>
                <Story />
            </div>
        )
    ]
};

export default meta;
type Story = StoryObj<typeof ColumnHeader>;

export const Admin: Story = {
    args: {
        title: 'Column Name',
        count: 12,
        variant: 'admin',
    },
};

export const Staff: Story = {
    args: {
        title: 'Column Name',
        count: 12,
        variant: 'staff',
    },
};

export const ZeroCount: Story = {
    args: {
        title: 'Empty State',
        count: 0,
        variant: 'admin',
    },
};

export const InteractiveAdmin: Story = {
    args: {
        title: 'Interactive Admin',
        count: 4,
        variant: 'admin',
        onConfigClick: fn(),
        onAddClick: fn()
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        
        // Target buttons by aria-label
        const configButton = canvas.getByRole('button', { name: /configure column/i });
        const addButton = canvas.getByRole('button', { name: /add item/i });
        
        await userEvent.click(configButton);
        await expect(args.onConfigClick).toHaveBeenCalled();
        
        await userEvent.click(addButton);
        await expect(args.onAddClick).toHaveBeenCalled();
    }
}
