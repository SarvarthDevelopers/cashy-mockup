import type { Meta, StoryObj } from '@storybook/react';
import { DealCardLarge } from './DealCardLarge';

const meta = {
  title: 'Card/DealCardLarge',
  component: DealCardLarge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    state: {
      control: 'radio',
      options: ['Default', 'Hover', 'Selected'],
    },
    priority: {
      control: 'boolean',
    },
    priorityType: {
      control: 'select',
      options: ['Highest', 'High', 'Medium', 'Low', 'Lowest'],
      if: { arg: 'priority', eq: true },
    },
    shopLabelColor: {
      control: 'select',
      options: ['Green', 'Lime', 'Rose', 'Pink', 'Blue', 'Turquoise'],
    },
    items: {
      control: 'object',
      description: 'Array of item names',
    },
    categories: {
      control: 'object',
      description: 'Array of category names',
    }
  },
} satisfies Meta<typeof DealCardLarge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    amount: '€6,540',
    bookingNo: '123456',
    customerName: 'Komsi Ogli',
    dueDate: 'Due Jan 19',
    priority: true,
    state: 'Default',
    priorityType: 'Highest',
    shopLabelColor: 'Green',
    shopLabelCountry: 'AT',
    shopLabelBranch: 'Wien',
    items: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
    categories: ['General Electronics', 'Car', 'Jewelry', 'Home']
  },
};

export const HoverState: Story = {
  args: {
    ...Default.args,
    state: 'Hover',
  },
};

export const SelectedState: Story = {
    args: {
      ...Default.args,
      state: 'Selected',
    },
};

export const LowPriorityExample: Story = {
    args: {
      ...Default.args,
      priorityType: 'Low',
      shopLabelColor: 'Turquoise',
      amount: '€1,200',
    },
};

export const MediumPriorityExample: Story = {
    args: {
        ...Default.args,
        priorityType: 'Medium',
        shopLabelColor: 'Blue',
        amount: '€3,400'
    }
};
