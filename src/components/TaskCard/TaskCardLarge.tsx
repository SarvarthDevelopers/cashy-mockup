import React, { useCallback, useState, useRef, useEffect } from 'react';
import './TaskCard.css';
import { Priority } from '../Card/Priority';

export type TaskPriority = 'high' | 'medium' | 'low';

const PRIORITY_MAP: Record<TaskPriority, 'Highest' | 'Medium' | 'Lowest'> = {
    high: 'Highest',
    medium: 'Medium',
    low: 'Lowest',
};

export interface TaskCardLargeProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Unique task ID — displayed as #ID in the meta row. */
    taskId: string;
    /** Name of the assignee / person who created the task. */
    assignee: string;
    /** Task title (max 60 characters). */
    title: string;
    /** Optional task description (max 160 characters). */
    description?: string;
    /**
     * Visual priority level, derived from due date:
     * - `high`   → due today   → red-50 background
     * - `medium` → due tomorrow → blue-50 background
     * - `low`    → other date  → white background
     * @default 'medium'
     */
    priority?: TaskPriority;
    /**
     * Due date shown in the meta row as "Today", "Tomorrow", or "Mar 15".
     * Omit to hide the date entirely.
     */
    dueDate?: Date;
    /** Called when the ⋯ more-options button is clicked. */
    /** Callback for editing the task */
  onEdit?: () => void;
  /** Callback for deleting the task */
  onDelete?: () => void;
  /** Retained for backward compatibility – optional */
  onMoreClick?: () => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Strips the time component from a date for day-level comparisons. */
function toDay(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** Formats a date as "Today", "Tomorrow", or a short locale string e.g. "Mar 15". */
function formatDueDate(date: Date): string {
    const todayMs = toDay(new Date());
    const dateMs = toDay(date);

    if (dateMs === todayMs) return 'Today';
    if (dateMs === todayMs + 86_400_000) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * `TaskCardLarge` displays a single task inside a Kanban column.
 * Background colour is determined by the `priority` prop.
 */
export const TaskCardLarge = React.forwardRef<HTMLDivElement, TaskCardLargeProps>((
    {
        taskId,
        assignee,
        title,
        description,
        priority = 'medium',
        dueDate,
        onEdit,
        onDelete,
        onMoreClick,
        className,
        ...props
    },
    ref,
) => {
    // -------------------------------------------------------------------
  // Context menu handling (mirrors DealCard implementation)
  // -------------------------------------------------------------------
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handler);
    }
    return () => document.removeEventListener('mousedown', handler);
  }, [isMenuOpen]);

  const handleMoreClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen((prev) => !prev);
    // Preserve previous onMoreClick behavior if needed
    onMoreClick?.();
  }, [onMoreClick]);

    const rootClassName = [
        'task-card',
        className,
    ].filter(Boolean).join(' ');

    return (
        <div ref={ref} className={rootClassName} {...props}>
            {/* Meta row: #ID / Assignee · Due date */}
            <div className="task-card__row task-card__row--header">
                <div className="task-card__meta">
                    <span>#{taskId}</span>
                    <span>/</span>
                    <span>{assignee}</span>
                    {dueDate && (
                        <>
                            <span aria-hidden="true">·</span>
                            <span>{formatDueDate(dueDate)}</span>
                        </>
                    )}
                </div>
                <div style={{ position: 'relative' }} ref={menuRef}>
                    <button
                        type="button"
                        className="task-card__more-button"
                        onClick={handleMoreClick}
                        aria-label="More options"
                    >
                        <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M4 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm5 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm5 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
                                fill="currentColor"
                            />
                        </svg>
                    </button>
                    {isMenuOpen && (
                        <div className="task-card-context-menu">
                            {onEdit && (
                                <button className="task-card-context-menu-item" onClick={() => { onEdit(); setIsMenuOpen(false); }}>
                                    Edit Task
                                </button>
                            )}
                            {onDelete && (
                                <button className="task-card-context-menu-item" onClick={() => { onDelete(); setIsMenuOpen(false); }}>
                                    Delete Task
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Title */}
            <div className="task-card__row task-card__row--title">
                <p className="task-card__title">{title}</p>
                {priority && (
                    <Priority type={PRIORITY_MAP[priority]} className="task-card__priority" />
                )}
            </div>

            {/* Description (optional) */}
            {description && (
                <div className="task-card__row task-card__row--description">
                    <p className="task-card__description">{description}</p>
                </div>
            )}
        </div>
    );
});

TaskCardLarge.displayName = 'TaskCardLarge';
