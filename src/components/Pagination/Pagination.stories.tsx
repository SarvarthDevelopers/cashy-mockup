import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Pagination } from './Pagination';

const meta: Meta<typeof Pagination> = {
    title: 'Components/Pagination',
    component: Pagination,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/design/SgNdO2YmHiOGzsGwy1ZHWN/CASHY-Design-System-Kit?node-id=21-575&t=JL116qCGQBMLHtwl-4',
        },
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['simple', 'entries', 'count'],
            description: 'Variant of the pagination',
        },
        currentPage: {
            control: 'number',
            description: 'Current active page',
        },
        totalPages: {
            control: 'number',
            description: 'Total number of pages',
        },
        onPageChange: { action: 'pageChanged' },
    },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

// Helper to make stories interactive
import { useState, useEffect } from 'react';
import type { PaginationProps } from './Pagination';

const InteractivePagination = (args: PaginationProps) => {
    const [page, setPage] = useState(args.currentPage);

    useEffect(() => {
        setPage(args.currentPage);
    }, [args.currentPage]);

    const handlePageChange = (p: number) => {
        setPage(p);
        args.onPageChange?.(p);
    };

    return <Pagination {...args} currentPage={page} onPageChange={handlePageChange} />;
};

export const Simple: Story = {
    args: {
        currentPage: 1,
        totalPages: 10,
        variant: 'simple',
        onPageChange: fn(),
    },
    render: (args) => <InteractivePagination {...args} />,
};

export const Entries: Story = {
    args: {
        currentPage: 1,
        totalPages: 20,
        variant: 'entries',
        itemsPerPage: 10,
        itemsPerPageOptions: [10, 20, 50, 100],
        onPageChange: fn(),
        onItemsPerPageChange: fn(),
    },
    render: (args) => <InteractivePagination {...args} />,
};

export const Count: Story = {
    args: {
        currentPage: 1,
        totalPages: 20,
        totalItems: 200,
        variant: 'count',
        onPageChange: fn(),
        onItemsPerPageChange: fn(),
    },
    render: (args) => <InteractivePagination {...args} />,
};

export const ManyPages: Story = {
    args: {
        currentPage: 50,
        totalPages: 100,
        variant: 'simple',
        onPageChange: fn(),
    },
    render: (args) => <InteractivePagination {...args} />,
};

export const StartRange: Story = {
    args: {
        currentPage: 3,
        totalPages: 20,
        variant: 'simple',
        onPageChange: fn(),
    },
    render: (args) => <InteractivePagination {...args} />,
};

export const EndRange: Story = {
    args: {
        currentPage: 18,
        totalPages: 20,
        variant: 'simple',
        onPageChange: fn(),
    },
    render: (args) => <InteractivePagination {...args} />,
};
