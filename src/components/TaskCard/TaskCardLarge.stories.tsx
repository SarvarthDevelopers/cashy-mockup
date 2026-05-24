import type { Meta, StoryObj } from '@storybook/react';
import { TaskCardLarge } from './TaskCardLarge';

const meta: Meta<typeof TaskCardLarge> = {
    title: 'Card/TaskCardLarge',
    component: TaskCardLarge,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/design/SgNdO2YmHiOGzsGwy1ZHWN/CASHY-Design-System-Kit?node-id=48931:52657',
        },
    },
    tags: ['autodocs'],
    argTypes: {
        priority: {
            control: 'radio',
            options: ['high', 'medium', 'low'],
            description: 'Priority level determines priority arrow: high (red up arrow), medium (yellow horizontal lines), low (blue down arrow)',
        },
        taskId: {
            control: 'text',
            description: 'Unique task identifier displayed as #ID',
        },
        assignee: {
            control: 'text',
            description: 'Name of the person assigned to the task',
        },
        title: {
            control: 'text',
            description: 'Task title (max 60 characters, capitalized)',
        },
        description: {
            control: 'text',
            description: 'Task description (max 160 characters)',
        },
        dueDate: {
            control: 'date',
            description: 'Due date — shown as "Today", "Tomorrow", or a short date like "Mar 15"',
        },
        onMoreClick: { action: 'more clicked' },
    },
};

export default meta;
type Story = StoryObj<typeof TaskCardLarge>;

const defaultDescription =
    'Description of the task will be shown like this. It has a 160 character limit. This text should show in full as there will be no dedicated view for this task card.';

export const HighPriority: Story = {
    args: {
        taskId: '189',
        assignee: 'Gregor K.',
        title: 'Task Title Goes Here In Capitalized Case With a Limit of 60 Characters.',
        description: defaultDescription,
        priority: 'high',
        dueDate: new Date(),
    },
};

export const MediumPriority: Story = {
    args: {
        taskId: '190',
        assignee: 'Maria S.',
        title: 'Review Quarterly Report and Prepare Summary For The Team',
        description: 'This task involves reviewing the Q3 financial reports and creating a concise summary with key metrics and action items for the leadership meeting.',
        priority: 'medium',
        dueDate: new Date(Date.now() + 86400000),
    },
};

export const LowPriority: Story = {
    args: {
        taskId: '191',
        assignee: 'Thomas W.',
        title: 'Update Documentation For API Changes Introduced In Sprint 24',
        description: 'Review all endpoint changes from Sprint 24 and update the developer documentation accordingly. Include migration guides where necessary.',
        priority: 'low',
        dueDate: new Date(Date.now() + 86400000 * 5),
    },
};

export const NoDescription: Story = {
    args: {
        taskId: '192',
        assignee: 'Lisa P.',
        title: 'Quick Fix: Update Button Colors On Settings Page',
        priority: 'high',
        dueDate: new Date(),
    },
};

export const ShortTitle: Story = {
    args: {
        taskId: '193',
        assignee: 'Alex M.',
        title: 'Fix Typo',
        description: 'There is a small typo on the dashboard page header.',
        priority: 'low',
        dueDate: new Date(Date.now() + 86400000 * 10),
    },
};
