import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskCardLarge } from './TaskCardLarge';
import { TaskCreateCardLarge } from './TaskCreateCardLarge';

describe('TaskCardLarge', () => {
    const baseProps = {
        taskId: '189',
        assignee: 'Gregor K.',
        title: 'Test Task Title',
        description: 'Test description text.',
    };

    it('renders task ID, assignee, title and description', () => {
        render(<TaskCardLarge {...baseProps} />);
        expect(screen.getByText('#189')).toBeInTheDocument();
        expect(screen.getByText('Gregor K.')).toBeInTheDocument();
        expect(screen.getByText('Test Task Title')).toBeInTheDocument();
        expect(screen.getByText('Test description text.')).toBeInTheDocument();
    });

    it('applies high priority class', () => {
        const { container } = render(<TaskCardLarge {...baseProps} priority="high" />);
        expect(container.firstChild).toHaveClass('task-card--priority-high');
    });

    it('applies medium priority class by default', () => {
        const { container } = render(<TaskCardLarge {...baseProps} />);
        expect(container.firstChild).toHaveClass('task-card--priority-medium');
    });

    it('applies low priority class', () => {
        const { container } = render(<TaskCardLarge {...baseProps} priority="low" />);
        expect(container.firstChild).toHaveClass('task-card--priority-low');
    });

    it('calls onMoreClick when more button is clicked', async () => {
        const user = userEvent.setup();
        const handleMore = vi.fn();
        render(<TaskCardLarge {...baseProps} onMoreClick={handleMore} />);

        const moreButton = screen.getByRole('button', { name: /more options/i });
        await user.click(moreButton);

        expect(handleMore).toHaveBeenCalledOnce();
    });

    it('renders without description when not provided', () => {
        render(<TaskCardLarge taskId="1" assignee="User" title="Title Only Task" />);
        expect(screen.getByText('Title Only Task')).toBeInTheDocument();
        expect(screen.queryByText('description')).not.toBeInTheDocument();
    });

    it('forwards ref correctly', () => {
        const ref = vi.fn();
        render(<TaskCardLarge {...baseProps} ref={ref} />);
        expect(ref).toHaveBeenCalled();
        expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
    });
});

describe('TaskCreateCardLarge', () => {
    const defaultProps = {
        onAdd: vi.fn(),
        onCancel: vi.fn(),
    };

    it('renders the creation form fields', () => {
        render(<TaskCreateCardLarge {...defaultProps} />);
        expect(screen.getByText('Adding task')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Write a task...')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
        expect(screen.getByText('Add')).toBeInTheDocument();
    });

    it('renders priority pills', () => {
        render(<TaskCreateCardLarge {...defaultProps} />);
        expect(screen.getByText('Today')).toBeInTheDocument();
        expect(screen.getByText('Tomorrow')).toBeInTheDocument();
        expect(screen.getByLabelText(/pick a custom date|custom date/i)).toBeInTheDocument();
    });

    it('calls onCancel when Cancel is clicked', async () => {
        const user = userEvent.setup();
        const handleCancel = vi.fn();
        render(<TaskCreateCardLarge onAdd={vi.fn()} onCancel={handleCancel} />);

        await user.click(screen.getByText('Cancel'));
        expect(handleCancel).toHaveBeenCalledOnce();
    });

    it('disables Add button when title is empty', () => {
        render(<TaskCreateCardLarge {...defaultProps} />);
        const addButton = screen.getByText('Add');
        expect(addButton).toBeDisabled();
    });

    it('enables Add and calls onAdd with data when title is entered', async () => {
        const user = userEvent.setup();
        const handleAdd = vi.fn();
        render(<TaskCreateCardLarge onAdd={handleAdd} onCancel={vi.fn()} />);

        const titleInput = screen.getByPlaceholderText('Write a task...');
        await user.type(titleInput, 'New Task');

        const addButton = screen.getByText('Add');
        expect(addButton).not.toBeDisabled();

        await user.click(addButton);
        expect(handleAdd).toHaveBeenCalledOnce();
        expect(handleAdd.mock.calls[0][0].title).toBe('New Task');
        expect(handleAdd.mock.calls[0][0].dueDate).toBeInstanceOf(Date);
    });

    it('selects Tomorrow pill when clicked', async () => {
        const user = userEvent.setup();
        render(<TaskCreateCardLarge {...defaultProps} />);

        const tomorrowPill = screen.getByText('Tomorrow');
        await user.click(tomorrowPill);

        expect(tomorrowPill).toHaveAttribute('aria-pressed', 'true');
    });

    it('limits title to 60 characters', async () => {
        const user = userEvent.setup();
        render(<TaskCreateCardLarge {...defaultProps} />);

        const titleInput = screen.getByPlaceholderText('Write a task...');
        const longTitle = 'A'.repeat(70);
        await user.type(titleInput, longTitle);

        expect((titleInput as HTMLInputElement).value.length).toBeLessThanOrEqual(60);
    });
});
