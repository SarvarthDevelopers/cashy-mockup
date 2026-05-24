import React, { useState, useEffect } from 'react';
import { KanBanBoard } from '../components/Board/KanBanBoard';
import { KanBanDndProvider } from '../components/Board/KanBanDndProvider';
import { KanBanColumn } from '../components/Board/KanBanColumn';
import { ColumnHeader } from '../components/ColumnHeader/ColumnHeader';
import { DraggableDealCard } from '../components/Card/DraggableDealCard';
import type { DealData } from '../data/mockData';
import { TaskCardLarge, type TaskPriority } from '../components/TaskCard/TaskCardLarge';
import { TaskCreateCardLarge } from '../components/TaskCard/TaskCreateCardLarge';
import { useToast } from '../components/Toast/useToast';
import type { ColumnConfig } from '../components/Board/types';
import { ColumnConfigPanel } from '../components/Board/ColumnConfigPanel';
import { ConfirmationModal } from '../components/Modal/ConfirmationModal';
// @ts-expect-error canvas-confetti does not have TypeScript declaration files installed in this project
import confetti from 'canvas-confetti';

interface TaskData {
    id: string;
    title: string;
    description: string;
    dueDate: Date;
    priority: TaskPriority;
    assignee: string;
}

interface BoardColumnWrapperProps {
    focused?: boolean;
    children: React.ReactNode;
    style?: React.CSSProperties;
}

const BoardColumnWrapper: React.FC<BoardColumnWrapperProps> = ({ children, style }) => {
    return <div style={style}>{children}</div>;
};

const generateTaskId = () => `task-${Math.random().toString(36).substring(2, 7)}`;

interface LandingPageProps {
    onSelectDeal: (deal: DealData) => void;
    selectedDealId?: string | null;
    dealsByColumn: Record<string, DealData[]>;
    columns: ColumnConfig[];
    onUpdateColumn: (updatedColumn: ColumnConfig) => void;
    onDeleteColumn: (columnId: string) => void;
    onAddColumn: (index: number) => string;
    onClearColumnsFocus?: () => void;
    onDealDragOver: (dealId: string, fromColumn: string, toColumn: string, toIndex: number) => void;
    onDealDragEnd: (columnId: string, oldIndex: number, newIndex: number) => void;
    onArchiveDeal?: (dealId: string) => void;
    onDragEndComplete?: (dealId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
    onSelectDeal, 
    selectedDealId, 
    dealsByColumn, 
    columns, 
    onUpdateColumn, 
    onDeleteColumn, 
    onAddColumn, 
    onClearColumnsFocus,
    onDealDragOver, 
    onDealDragEnd, 
    onArchiveDeal, 
    onDragEndComplete 
}) => {
    const [tasksByColumn, setTasksByColumn] = useState<Record<string, TaskData[]>>({});
    const [addingToColumn, setAddingToColumn] = useState<string | null>(null);
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [activeConfigColumnId, setActiveConfigColumnId] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [columnToDelete, setColumnToDelete] = useState<ColumnConfig | null>(null);
    const [deleteModalType, setDeleteModalType] = useState<'confirm' | 'warning'>('confirm');
    const { showToast } = useToast();

    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const handleAddColumn = (index: number) => {
        const newId = onAddColumn(index);
        if (newId) {
            showToast('New column added successfully.', 'success');
            // Confetti burst for micro-interaction delight!
            try {
                confetti({
                    particleCount: 80,
                    spread: 60,
                    origin: { y: 0.8 },
                    colors: ['#4649e5', '#60a5fa', '#34d399', '#f472b6']
                });
            } catch (err) {
                console.error('Failed to trigger confetti', err);
            }
        }
    };

    const handleArchive = (dealId: string) => {
        onArchiveDeal?.(dealId);
        showToast(`Deal #${dealId} archived successfully.`, 'success');
    };

    const handleAddTask = (columnId: string, data: { title: string; description: string; dueDate: Date }) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(data.dueDate.getFullYear(), data.dueDate.getMonth(), data.dueDate.getDate());
        const diff = target.getTime() - today.getTime();
        
        let priority: TaskPriority = 'low';
        if (diff <= 0) priority = 'high';
        else if (diff <= 86400000) priority = 'medium';

        const newTask: TaskData = {
            id: generateTaskId(),
            title: data.title,
            description: data.description,
            dueDate: data.dueDate,
            priority,
            assignee: 'Admin'
        };

        setTasksByColumn(prev => ({
            ...prev,
            [columnId]: [newTask, ...(prev[columnId] || [])]
        }));
        setAddingToColumn(null);
    };

    const handleSaveTask = (columnId: string, taskId: string, data: { title: string; description: string; dueDate: Date }) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(data.dueDate.getFullYear(), data.dueDate.getMonth(), data.dueDate.getDate());
        const diff = target.getTime() - today.getTime();
        
        let priority: TaskPriority = 'low';
        if (diff <= 0) priority = 'high';
        else if (diff <= 86400000) priority = 'medium';

        setTasksByColumn(prev => ({
            ...prev,
            [columnId]: (prev[columnId] || []).map(t => t.id === taskId ? {
                ...t,
                title: data.title,
                description: data.description,
                dueDate: data.dueDate,
                priority
            } : t)
        }));
        setEditingTaskId(null);
        showToast('Task updated successfully.', 'success');
    };

    const handleDeleteTask = (columnId: string, taskId: string) => {
        setTasksByColumn(prev => ({
            ...prev,
            [columnId]: (prev[columnId] || []).filter(t => t.id !== taskId)
        }));
        showToast('Task deleted successfully.', 'success');
    };

    return (
        <div className="flex flex-col h-full w-full bg-background text-foreground overflow-hidden relative" onClick={onClearColumnsFocus}>
            <div className="flex-1 overflow-hidden relative">
                {isLoading ? (
                    <div className="cashy-kanban-board animate-pulse select-none bg-[var(--background-secondary)]/50">
                        <div className="cashy-kanban-interaction-zone" />
                        {[1, 2, 3, 4].map(idx => (
                            <React.Fragment key={idx}>
                                <div className="cashy-kanban-column">
                                    <div className="cashy-kanban-column-header">
                                        <div className="flex items-center justify-between">
                                            <div className="h-5 w-28 bg-gray-200 rounded-md" />
                                            <div className="flex items-center gap-1.5">
                                                <div className="h-8 w-8 bg-gray-100 rounded-lg" />
                                                <div className="h-8 w-8 bg-gray-100 rounded-lg" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="cashy-kanban-column-body">
                                        {[1, 2].map(cardIdx => (
                                            <div key={cardIdx} className="task-card">
                                                <div className="task-card__row task-card__row--header">
                                                    <div className="task-card__meta">
                                                        <div className="h-3.5 w-16 bg-gray-200 rounded" />
                                                        <span aria-hidden="true">·</span>
                                                        <div className="h-3.5 w-10 bg-gray-200 rounded" />
                                                    </div>
                                                    <div className="h-4 w-4 bg-gray-200 rounded-full" />
                                                </div>
                                                <div className="task-card__row task-card__row--title">
                                                    <div className="h-4 w-5/6 bg-gray-200 rounded" />
                                                </div>
                                                <div className="task-card__row task-card__row--description">
                                                    <div className="h-3.5 w-4/6 bg-gray-100 rounded" />
                                                </div>
                                                <div className="flex gap-1.5 mt-1">
                                                    <div className="h-4 w-12 bg-gray-100 rounded-full" />
                                                    <div className="h-4 w-10 bg-gray-100 rounded-full" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="cashy-kanban-interaction-zone" />
                            </React.Fragment>
                        ))}
                    </div>
                ) : (
                    <KanBanDndProvider onDealDragOver={onDealDragOver} onDealDragEnd={onDealDragEnd} dealsByColumn={dealsByColumn} onDragEndComplete={onDragEndComplete}>
                    <KanBanBoard onAddColumn={handleAddColumn} className="animate-in fade-in duration-500">
                    {columns.map((column) => {
                        const deals = dealsByColumn[column.id] || [];
                        const tasks = tasksByColumn[column.id] || [];

                        // Show column if it is a custom column, has deals, has tasks, or is being configured/edited
                        const isInitialColumn = [
                            'car-inbox', 'call-attempt', 'send-documents', 'data-received', 
                            'price-research', 'waiting-documents', 'final-control', 
                            'appointment', 'payout-storage', 'archive'
                        ].includes(column.id);

                        if (isInitialColumn && 
                            deals.length === 0 && 
                            tasks.length === 0 && 
                            addingToColumn !== column.id && 
                            activeConfigColumnId !== column.id
                        ) {
                            return null;
                        }

                        const isConfigActive = activeConfigColumnId === column.id;

                        return (
                            <BoardColumnWrapper key={column.id} focused={column.focused} style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
                                {/* Top color strip */}
                                {column.color && (
                                    <div 
                                        style={{ 
                                            height: '6px', 
                                            backgroundColor: column.color, 
                                            width: '100%',
                                            flexShrink: 0
                                        }} 
                                    />
                                )}

                                <div className="cashy-kanban-column-header">
                                    <ColumnHeader
                                        title={column.title}
                                        count={(deals.length + (tasksByColumn[column.id]?.length || 0))}
                                        variant="admin"
                                        isConfigActive={isConfigActive}
                                        onConfigClick={() => {
                                            if (isConfigActive) {
                                                setActiveConfigColumnId(null);
                                            } else {
                                                setActiveConfigColumnId(column.id);
                                            }
                                        }}
                                        onAddClick={() => setAddingToColumn(column.id)}
                                    />
                                </div>

                                {isConfigActive ? (
                                    <ColumnConfigPanel
                                        column={column}
                                        onChange={onUpdateColumn}
                                        onClose={() => setActiveConfigColumnId(null)}
                                        disableDelete={column.id === columns[0]?.id}
                                        onDelete={() => {
                                            const deals = dealsByColumn[column.id] || [];
                                            setColumnToDelete(column);
                                            if (deals.length > 0) {
                                                setDeleteModalType('warning');
                                            } else {
                                                setDeleteModalType('confirm');
                                            }
                                            setIsDeleteModalOpen(true);
                                        }}
                                    />
                                ) : (
                                    <KanBanColumn id={column.id} dealIds={deals.map(d => d.id)}>
                                        {addingToColumn === column.id && (
                                            <TaskCreateCardLarge
                                                onAdd={(data) => handleAddTask(column.id, data)}
                                                onCancel={() => setAddingToColumn(null)}
                                            />
                                        )}

                                        {tasksByColumn[column.id]?.map(task => (
                                            editingTaskId === task.id ? (
                                                <TaskCreateCardLarge
                                                    key={task.id}
                                                    initialTitle={task.title}
                                                    initialDescription={task.description}
                                                    initialDueDate={task.dueDate}
                                                    headerTitle="Editing task"
                                                    submitLabel="Save"
                                                    onAdd={(data) => handleSaveTask(column.id, task.id, data)}
                                                    onCancel={() => setEditingTaskId(null)}
                                                />
                                            ) : (
                                                <TaskCardLarge
                                                    key={task.id}
                                                    taskId={task.id.replace('task-', '')}
                                                    title={task.title}
                                                    description={task.description}
                                                    dueDate={task.dueDate}
                                                    priority={task.priority}
                                                    assignee={task.assignee}
                                                    onEdit={() => setEditingTaskId(task.id)}
                                                    onDelete={() => handleDeleteTask(column.id, task.id)}
                                                />
                                            )
                                        ))}

                                        {deals.map(deal => {
                                            const isHighPriority = deal.flags?.includes('HIGH VALUE');

                                            return (
                                                <DraggableDealCard
                                                    key={deal.id}
                                                    dealId={deal.id}
                                                    bookingNo={`#${deal.id}`}
                                                    customerName={`${deal.firstName} ${deal.lastName}`}
                                                    amount={deal.amount || ''}
                                                    dueDate={deal.dueDate || deal.appointmentDate || 'No Date'}
                                                    priority={isHighPriority}
                                                    priorityType={isHighPriority ? "Highest" : "Medium"}
                                                    shopLabelCountry={deal.countryCode}
                                                    shopLabelBranch={deal.branch}
                                                    items={deal.items}
                                                    categories={[deal.businessArea || 'General']}
                                                    state={deal.id === selectedDealId ? "Selected" : "Default"}
                                                    onClick={() => onSelectDeal(deal)}
                                                    onArchive={() => handleArchive(deal.id)}
                                                />
                                            );
                                        })}
                                    </KanBanColumn>
                                )}
                            </BoardColumnWrapper>
                        );
                    })}
                </KanBanBoard>
                </KanBanDndProvider>
                )}
            </div>
            
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                title={deleteModalType === 'warning' ? "Cannot Delete Column" : "Delete Column"}
                description={
                    deleteModalType === 'warning'
                        ? "This column contains active deal cards. You must move all deals in this column to another column first in order to delete it."
                        : `Are you sure you want to delete the column "${columnToDelete?.title}"? All tasks in this column will be permanently deleted. This action cannot be undone.`
                }
                variant={deleteModalType === 'warning' ? "warning" : "danger"}
                confirmText={deleteModalType === 'warning' ? "I Understand" : "Delete Column"}
                cancelText="Cancel"
                onConfirm={() => {
                    if (columnToDelete) {
                        onDeleteColumn(columnToDelete.id);
                        setActiveConfigColumnId(null);
                        setIsDeleteModalOpen(false);
                        setColumnToDelete(null);
                    }
                }}
            />
        </div>
    );
};
