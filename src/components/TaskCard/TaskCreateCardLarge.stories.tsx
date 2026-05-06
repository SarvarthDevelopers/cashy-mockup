import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { TaskCreateCardLarge } from './TaskCreateCardLarge';

const meta: Meta<typeof TaskCreateCardLarge> = {
    title: 'Card/TaskCreateCardLarge',
    component: TaskCreateCardLarge,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/design/SgNdO2YmHiOGzsGwy1ZHWN/CASHY-Design-System-Kit?node-id=48929:52309',
        },
    },
    tags: ['autodocs'],
    argTypes: {
        onAdd: { action: 'task added' },
        onCancel: { action: 'cancelled' },
    },
    decorators: [
        (Story) => (
            <div style={{ minHeight: '500px', display: 'flex', alignItems: 'flex-start', paddingTop: '20px' }}>
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof TaskCreateCardLarge>;

export const Default: Story = {
    args: {
        onAdd: fn(),
        onCancel: fn(),
    },
};

export const WithCalendarOpen: Story = {
    args: {
        onAdd: fn(),
        onCancel: fn(),
    },
    parameters: {
        docs: {
            description: {
                story: 'Click the calendar icon to open the date picker for selecting a custom due date. Dates before day-after-tomorrow are disabled since Today and Tomorrow have dedicated pills.',
            },
        },
    },
};
