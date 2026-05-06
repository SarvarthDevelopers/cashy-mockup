import React, { useState, useCallback } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { KanBanBoard } from './KanBanBoard';
import { ColumnHeader } from '../ColumnHeader/ColumnHeader';
import { TaskCardLarge, TaskCreateCardLarge } from '../TaskCard';
import type { TaskPriority } from '../TaskCard';

/* ========================================
   Shared Types
   ======================================== */

interface TaskItem {
    id: string;
    taskId: string;
    assignee: string;
    title: string;
    description: string;
    priority: TaskPriority;
    dueDate: Date;
}

interface ColumnData {
    id: string;
    title: string;
    variant: 'admin' | 'staff';
    /** When true, the column gets the --focused ring (just added via the + button). */
    focused: boolean;
    tasks: TaskItem[];
}

/* ========================================
   Close Icon (for the × toggle)
   ======================================== */

const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
            d="M15 5L5 15M5 5L15 15"
            stroke="currentColor"
            strokeWidth="1.67"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

/* ========================================
   Priority Helper
   ======================================== */

function getPriorityFromDate(dueDate: Date): TaskPriority {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    if (dueDay.getTime() === today.getTime()) return 'high';
    if (dueDay.getTime() === tomorrow.getTime()) return 'medium';
    return 'low';
}

/* ========================================
   Priority Sort Helper
   ======================================== */

const PRIORITY_ORDER: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };

function insertTaskSorted(tasks: TaskItem[], newTask: TaskItem): TaskItem[] {
    const newOrder = PRIORITY_ORDER[newTask.priority];
    const insertIdx = tasks.findIndex((t) => PRIORITY_ORDER[t.priority] > newOrder);
    const result = [...tasks];
    if (insertIdx === -1) {
        result.push(newTask);
    } else {
        result.splice(insertIdx, 0, newTask);
    }
    return result;
}

/* ========================================
   Interactive Column Component
   ======================================== */

interface InteractiveColumnProps {
    column: ColumnData;
    highlightedTaskId: string | null;
    onAddTask: (columnId: string, task: Omit<TaskItem, 'id'>) => void;
    /** Forwarded to the root div so KanBanBoard can read child.props.focused */
    focused?: boolean;
}

// `focused` is intentionally not used in the component body.
// KanBanBoard.tsx reads it via child.props.focused at the React element level
// to apply the .cashy-kanban-column--focused highlight ring.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const InteractiveColumn: React.FC<InteractiveColumnProps> = ({ column, highlightedTaskId, onAddTask, focused: _focused }) => {
    const [isCreating, setIsCreating] = useState(false);

    const handleAddClick = useCallback(() => {
        setIsCreating((prev) => !prev);
    }, []);

    const handleAddTask = useCallback(
        (data: { title: string; description: string; dueDate: Date }) => {
            const priority = getPriorityFromDate(data.dueDate);
            const taskNumber = String(Math.floor(Math.random() * 900) + 100);
            onAddTask(column.id, {
                taskId: taskNumber,
                assignee: 'You',
                title: data.title,
                description: data.description,
                priority,
                dueDate: data.dueDate,
            });
            setIsCreating(false);
        },
        [column.id, onAddTask],
    );

    const handleCancel = useCallback(() => {
        setIsCreating(false);
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Column Header — Plus toggles to × when creating */}
            <div className="cashy-kanban-column-header">
                <ColumnHeader
                    title={column.title}
                    count={column.tasks.length}
                    variant={column.variant}
                    onAddClick={handleAddClick}
                />
                {/* Overlay the close button on top of plus icon when creating */}
                {isCreating && (
                    <button
                        type="button"
                        onClick={handleAddClick}
                        aria-label="Cancel adding task"
                        style={{
                            position: 'absolute',
                            right: '8px',
                            top: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            backgroundColor: 'var(--background-error-primary)',
                            border: '1px solid var(--border-primary)',
                            borderRadius: 'var(--radius-200)',
                            color: 'var(--text-error)',
                            cursor: 'pointer',
                            padding: 0,
                            zIndex: 15,
                            transition: 'all 0.2s ease',
                        }}
                    >
                        <CloseIcon />
                    </button>
                )}
            </div>

            {/* Column Body: Create Form + Task Cards */}
            <div className="cashy-kanban-column-body">
                {/* Task Creation Card — appears at the top of the column */}
                {isCreating && (
                    <TaskCreateCardLarge
                        onAdd={handleAddTask}
                        onCancel={handleCancel}
                    />
                )}

                {/* Task Cards — highlight border on the newly created one */}
                {column.tasks.map((task) => (
                    <TaskCardLarge
                        key={task.id}
                        taskId={task.taskId}
                        assignee={task.assignee}
                        title={task.title}
                        description={task.description}
                        priority={task.priority}
                        dueDate={task.dueDate}
                        className={task.id === highlightedTaskId ? 'task-card--highlighted' : ''}
                    />
                ))}
            </div>
        </div>
    );
};

/* ========================================
   Story Meta
   ======================================== */

const meta = {
    title: 'Board/KanBanBoard',
    component: KanBanBoard,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
    argTypes: {
        onAddColumn: { action: 'onAddColumn' },
    },
} satisfies Meta<typeof KanBanBoard>;

export default meta;

type StoryProps = React.ComponentProps<typeof KanBanBoard> & {
    firstColumnTitle?: string;
    firstColumnCount?: number;
    colCount?: number;
};
type Story = StoryObj<StoryProps>;

/* ========================================
   Dummy Column (plain placeholder cards)
   ======================================== */

interface DummyColumnProps {
    title: string;
    count: number;
    variant?: 'admin' | 'staff';
    /** Passed through to KanBanBoard so it can apply the --focused ring. */
    focused?: boolean;
}

const DummyColumn: React.FC<DummyColumnProps> = ({ title, count, variant = 'admin' }) => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className="cashy-kanban-column-header">
            <ColumnHeader title={title} count={count} variant={variant} />
        </div>
        <div className="cashy-kanban-column-body">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={`dummy-card-${i}`}
                    style={{
                        minHeight: '96px',
                        width: '100%',
                        backgroundColor: 'var(--background-secondary, #F4F5F7)',
                        borderRadius: 'var(--radius-200, 8px)',
                        border: '1px solid var(--border-primary, #E2E8F0)',
                        flexShrink: 0,
                    }}
                />
            ))}
        </div>
    </div>
);

/* ========================================
   Default Story
   ======================================== */

export const Default: Story = {
    args: {
        firstColumnTitle: 'Editable Column',
        firstColumnCount: 12,
        colCount: 5,
        onAddColumn: fn(),
    },
    render: function Render(args) {
        const initialColumns = React.useMemo(
            () =>
                Array.from({ length: args.colCount ?? 5 }).map((_, i) => ({
                    id: `col-${i}`,
                    title: i === 0 ? (args.firstColumnTitle ?? 'Column 1') : `Column ${i + 1}`,
                    count: i === 0 ? (args.firstColumnCount ?? 12) : Math.floor(Math.random() * 20),
                    variant: (i % 2 === 0 ? 'admin' : 'staff') as 'admin' | 'staff',
                    focused: false,
                })),
            [args.colCount, args.firstColumnCount, args.firstColumnTitle],
        );

        const [columns, setColumns] = React.useState(initialColumns);

        React.useEffect(() => {
            setColumns((cols) => {
                const newCols = [...cols];
                if (newCols.length > 0) {
                    newCols[0].title = args.firstColumnTitle ?? newCols[0].title;
                    newCols[0].count = args.firstColumnCount ?? newCols[0].count;
                }
                return newCols;
            });
        }, [args.firstColumnTitle, args.firstColumnCount]);

        const handleAddColumn = React.useCallback(
            (index: number) => {
                if (args.onAddColumn) args.onAddColumn(index);
                const newColumn = {
                    id: `col-new-${Date.now()}`,
                    title: 'New Column',
                    count: 0,
                    variant: 'staff' as const,
                    focused: true,
                };
                setColumns((prev) => {
                    const next = [...prev];
                    next.splice(index, 0, newColumn);
                    return next;
                });
            },
            [args],
        );

        return (
            <div onClick={() => setColumns((prev) => prev.map((c) => ({ ...c, focused: false })))}>
                <KanBanBoard {...args} onAddColumn={handleAddColumn}>
                    {columns.map((col) => (
                        <DummyColumn
                            key={col.id}
                            title={col.title}
                            count={col.count}
                            variant={col.variant}
                            focused={col.focused}
                        />
                    ))}
                </KanBanBoard>
            </div>
        );
    },
};

/* ========================================
   WithTaskCreation Story — Interactive Demo
   ======================================== */

const sampleTasks: TaskItem[] = [
    {
        id: 'task-1',
        taskId: '189',
        assignee: 'Gregor K.',
        title: 'Review Payment Gateway Integration',
        description: 'Verify all Stripe webhook handlers are correctly processing refunds and subscription changes.',
        priority: 'high',
        dueDate: new Date(),
    },
    {
        id: 'task-2',
        taskId: '188',
        assignee: 'Maria S.',
        title: 'Update Customer Onboarding Flow',
        description: 'The new onboarding screens need to be integrated with the backend user profile API.',
        priority: 'medium',
        dueDate: new Date(Date.now() + 86400000),
    },
    {
        id: 'task-3',
        taskId: '187',
        assignee: 'Thomas W.',
        title: 'Audit Accessibility On Settings Page',
        description: 'Run WCAG 2.1 AA audit and fix all critical violations in the settings page.',
        priority: 'low',
        dueDate: new Date(Date.now() + 86400000 * 5),
    },
];

export const WithTaskCreation: Story = {
    parameters: {
        docs: {
            description: {
                story: `### 🎯 Interactive Task Creation Demo

This story demonstrates the **full task creation flow** within the KanBan board:

1. **Click the ➕ button** on any column header to start adding a task
2. The button **turns into a ✕ close button** while the creation form is active
3. **Fill in the task title** (required) and optional description
4. **Select priority** via the date pills:
   - **Today** → High priority (🔴 red background)
   - **Tomorrow** → No priority (🔵 blue background)
   - **📅 Calendar** → Low priority (⬜ white background)
5. Click **Add** — the task is **inserted in priority order** in the column
6. A **toast notification** appears at the bottom: *"✓ Task added in [Column Name]"*
7. The new card gets a **brand-colored highlight border** — click anywhere to clear it
8. Click **Cancel** or **✕** to dismiss the form without saving

> **For detailed component docs:** see *Components > TaskCard > TaskCardLarge* and *TaskCreateCardLarge* stories.
`,
            },
        },
    },
    render: function RenderWithTaskCreation() {
        const [columns, setColumns] = useState<ColumnData[]>([
            {
                id: 'col-inbox',
                title: 'Inbox',
                variant: 'admin',
                focused: false,
                tasks: [sampleTasks[0]],
            },
            {
                id: 'col-in-progress',
                title: 'In Progress',
                variant: 'admin',
                focused: false,
                tasks: [sampleTasks[1], sampleTasks[2]],
            },
            {
                id: 'col-review',
                title: 'Review',
                variant: 'staff',
                focused: false,
                tasks: [],
            },
            {
                id: 'col-done',
                title: 'Done',
                variant: 'staff',
                focused: false,
                tasks: [],
            },
        ]);

        // key forces React to remount toast div, restarting the CSS animation on repeat adds
        const [toast, setToast] = useState<{ message: string; key: number } | null>(null);
        // ID of the just-created task — drives the highlight border
        const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);

        const handleAddTask = useCallback(
            (columnId: string, task: Omit<TaskItem, 'id'>) => {
                const newTaskId = `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
                const newTask: TaskItem = { ...task, id: newTaskId };

                setColumns((prev) => {
                    // Read column name from the latest state inside the updater
                    const columnName = prev.find((c) => c.id === columnId)?.title ?? 'column';
                    // Show toast outside setState (state updater must be pure)
                    setTimeout(() => {
                        setToast({ message: `Task added in "${columnName}"`, key: Date.now() });
                        setTimeout(() => setToast(null), 3200);
                    }, 0);
                    return prev.map((col) =>
                        col.id === columnId
                            ? { ...col, tasks: insertTaskSorted(col.tasks, newTask) }
                            : col,
                    );
                });

                setHighlightedTaskId(newTaskId);
            },
            [], // stable — reads columns via functional setState
        );

        const handleAddColumn = useCallback((index: number) => {
            const newCol: ColumnData = {
                id: `col-${Date.now()}`,
                title: 'New Column',
                variant: 'staff',
                focused: true,
                tasks: [],
            };
            setColumns((prev) => {
                const next = [...prev];
                next.splice(index, 0, newCol);
                return next;
            });
        }, []);

        // Any click on board clears focused columns AND the task highlight
        const handleBoardClick = useCallback(() => {
            setColumns((prev) => prev.map((c) => ({ ...c, focused: false })));
            if (highlightedTaskId) setHighlightedTaskId(null);
        }, [highlightedTaskId]);

        return (
            <div onClick={handleBoardClick}>
                <KanBanBoard onAddColumn={handleAddColumn}>
                    {columns.map((col) => (
                        <InteractiveColumn
                            key={col.id}
                            column={col}
                            focused={col.focused}
                            highlightedTaskId={highlightedTaskId}
                            onAddTask={handleAddTask}
                        />
                    ))}
                </KanBanBoard>

                {/* Board-level toast — outside KanBanBoard so it's never clipped */}
                {toast && (
                    <div key={toast.key} className="task-toast">
                        ✓ {toast.message}
                    </div>
                )}
            </div>
        );
    },
};
