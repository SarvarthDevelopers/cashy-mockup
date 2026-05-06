import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';
import { Radio } from './Radio';
import { RadioGroup } from './RadioGroup';

const meta = {
    title: 'Components/Radio',
    component: RadioGroup, // The main interaction is usually via group
    subcomponents: { Radio },
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        direction: {
            control: { type: 'radio' },
            options: ['vertical', 'horizontal'],
        },
        size: {
            control: { type: 'select' },
            options: ['small', 'medium', 'large'],
        },
        disabled: { control: 'boolean' },
    },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {

        defaultValue: 'basic',
        children: (
            <>
                <Radio value="basic" label="Basic Plan" />
                <Radio value="pro" label="Pro Plan" />
                <Radio value="enterprise" label="Enterprise Plan" />
            </>
        ),
    },
};

export const WithDescriptions: Story = {
    args: {

        defaultValue: 'standard',
        children: (
            <>
                <Radio
                    value="standard"
                    label="Standard Shipping"
                    description="5-7 business days"
                />
                <Radio
                    value="express"
                    label="Express Shipping"
                    description="1-2 business days"
                />
            </>
        ),
    },
};

export const Horizontal: Story = {
    args: {

        direction: 'horizontal',
        defaultValue: 'red',
        children: (
            <>
                <Radio value="red" label="Red" />
                <Radio value="green" label="Green" />
                <Radio value="blue" label="Blue" />
            </>
        ),
    },
};

export const Disabled: Story = {
    args: {

        disabled: true,
        defaultValue: '1',
        children: (
            <>
                <Radio value="1" label="Option 1" />
                <Radio value="2" label="Option 2" />
            </>
        ),
    },
};

// Story demonstrating controlled state via standard useArgs API
export const Controlled: Story = {
    args: {
        value: '2',
        name: 'controlled',
        children: <></>, // Dummy payload to satisfy TS requirement structure, overridden in render function
    },
    render: function Render(args) {
        const [, updateArgs] = useArgs();
        const onChange = (newValue: string) => {
            updateArgs({ value: newValue });
            args.onChange?.(newValue);
        };
        return (
            <RadioGroup {...args} onChange={onChange}>
                <Radio value="1" label="Controlled 1" />
                <Radio value="2" label="Controlled 2 (Selected)" />
            </RadioGroup>
        );
    },
};
