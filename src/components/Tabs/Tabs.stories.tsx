import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from './Tabs';
import { Tab } from './Tab';

const meta: Meta<typeof Tabs> = {
    title: 'Components/Tabs',
    component: Tabs,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/design/SgNdO2YmHiOGzsGwy1ZHWN/CASHY-Design-System-Kit?node-id=58-2991&t=JL116qCGQBMLHtwl-4',
        },
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['underline', 'pill', 'ghost', 'segment', 'stepper'],
            description: 'Visual variant of the tabs',
        },
        fullWidth: {
            control: 'boolean',
            description: 'Whether tabs should take up full container width',
        },
        onValueChange: { action: 'value changed' },
    },
};

export default meta;

export interface TabItem {
    value: string;
    label: string;
    subtitle?: string;
    disabled?: boolean;
}

interface DynamicStoryProps extends React.ComponentProps<typeof Tabs> {
    items?: TabItem[];
    showIcon?: boolean;
}

const renderDynamicTabs = (args: DynamicStoryProps) => {
    const icon1 = args.showIcon ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    ) : undefined;
    const icon2 = args.showIcon ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    ) : undefined;

    return (
        <Tabs {...args}>
            {args.items?.map((item, idx) => (
                <Tab 
                    key={item.value} 
                    value={item.value} 
                    subtitle={item.subtitle}
                    disabled={item.disabled}
                    icon={idx === 0 ? icon1 : idx === 1 ? icon2 : undefined}
                >
                    {item.label}
                </Tab>
            ))}
        </Tabs>
    );
};

export const Underline: StoryObj<DynamicStoryProps> = {
    args: {
        defaultValue: 'tab1',
        variant: 'underline',
        showIcon: false,
        items: [
            { value: 'tab1', label: 'Account' },
            { value: 'tab2', label: 'Preferences' },
            { value: 'tab3', label: 'Security' }
        ]
    },
    render: renderDynamicTabs
};

export const UnderlineWithSubtitle: StoryObj<DynamicStoryProps> = {
    args: {
        defaultValue: 'item1',
        variant: 'underline-thick',
        showIcon: false,
        items: [
            { value: 'item1', label: 'ITEM 1', subtitle: 'Peugeot 208' },
            { value: 'item2', label: 'ITEM 2', subtitle: 'iPhone 16' },
            { value: 'item3', label: 'ITEM 3', subtitle: 'Tissot PRX' }
        ]
    },
    render: renderDynamicTabs
};

export const Pill: StoryObj<DynamicStoryProps> = {
    args: {
        defaultValue: 'tab1',
        variant: 'pill',
        showIcon: false,
        items: [
            { value: 'tab1', label: 'All' },
            { value: 'tab2', label: 'Active' },
            { value: 'tab3', label: 'Completed' }
        ]
    },
    render: renderDynamicTabs
};

export const Ghost: StoryObj<DynamicStoryProps> = {
    args: {
        defaultValue: 'tab1',
        variant: 'ghost',
        showIcon: false,
        items: [
            { value: 'tab1', label: 'Overview' },
            { value: 'tab2', label: 'Analytics' },
            { value: 'tab3', label: 'Reports' }
        ]
    },
    render: renderDynamicTabs
};

export const Segment: StoryObj<DynamicStoryProps> = {
    args: {
        defaultValue: 'tab1',
        variant: 'segment',
        showIcon: false,
        items: [
            { value: 'tab1', label: 'Daily' },
            { value: 'tab2', label: 'Weekly' },
            { value: 'tab3', label: 'Monthly' }
        ]
    },
    render: renderDynamicTabs
};

export const Stepper: StoryObj<DynamicStoryProps> = {
    args: {
        defaultValue: 'step3',
        variant: 'stepper',
        showIcon: false,
        items: [
            { value: 'step1', label: '1. Research' },
            { value: 'step2', label: '2. Price' },
            { value: 'step3', label: '3. Verification' },
            { value: 'step4', label: '4. Documents' },
            { value: 'step5', label: '5. Approval' },
            { value: 'step6', label: '6. Payout' },
            { value: 'step7', label: '7. Storage' }
        ]
    },
    render: renderDynamicTabs
};

export const FullWidth: StoryObj<DynamicStoryProps> = {
    args: {
        defaultValue: 'tab1',
        variant: 'underline',
        fullWidth: true,
        showIcon: false,
        items: [
            { value: 'tab1', label: 'Login' },
            { value: 'tab2', label: 'Register' }
        ]
    },
    decorators: [
        (Story) => (
            <div style={{ width: '400px' }}>
                <Story />
            </div>
        ),
    ],
    render: renderDynamicTabs
};

export const DisabledTab: StoryObj<DynamicStoryProps> = {
    args: {
        defaultValue: 'tab1',
        variant: 'underline',
        showIcon: false,
        items: [
            { value: 'tab1', label: 'Available' },
            { value: 'tab2', label: 'Unavailable', disabled: true },
            { value: 'tab3', label: 'Hidden' }
        ]
    },
    render: renderDynamicTabs
};
