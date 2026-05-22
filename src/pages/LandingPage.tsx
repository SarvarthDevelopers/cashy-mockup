import React, { useState } from 'react';
import { KanBanBoard } from '../components/Board/KanBanBoard';
import { KanBanDndProvider } from '../components/Board/KanBanDndProvider';
import { KanBanColumn } from '../components/Board/KanBanColumn';
import { ColumnHeader } from '../components/ColumnHeader/ColumnHeader';
import { DraggableDealCard } from '../components/Card/DraggableDealCard';
import { COLUMNS } from '../data/mockData';
import type { ColumnId, DealData } from '../data/mockData';
import { TaskCardLarge, type TaskPriority } from '../components/TaskCard/TaskCardLarge';
import { TaskCreateCardLarge } from '../components/TaskCard/TaskCreateCardLarge';
import { useToast } from '../components/Toast/ToastContext';

interface TaskData {
    id: string;
    title: string;
    description: string;
    dueDate: Date;
    priority: TaskPriority;
    assignee: string;
}

interface LandingPageProps {
    onSelectDeal: (deal: DealData) => void;
    dealsByColumn: Record<ColumnId, DealData[]>;
    onDealDragOver: (dealId: string, fromColumn: ColumnId, toColumn: ColumnId, toIndex: number) => void;
    onDealDragEnd: (columnId: ColumnId, oldIndex: number, newIndex: number) => void;
    onArchiveDeal?: (dealId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectDeal, dealsByColumn, onDealDragOver, onDealDragEnd, onArchiveDeal }) => {
    const [tasksByColumn, setTasksByColumn] = useState<Record<ColumnId, TaskData[]>>({} as any);
    const [addingToColumn, setAddingToColumn] = useState<ColumnId | null>(null);
    const { showToast } = useToast();

    const onAddColumn = (index: number) => {
        console.log('Add column at index:', index);
    };

    const handleArchive = (dealId: string) => {
        onArchiveDeal?.(dealId);
        showToast(`Deal #${dealId} archived successfully.`, 'success');
    };

    const handleAddTask = (columnId: ColumnId, data: { title: string; description: string; dueDate: Date }) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(data.dueDate.getFullYear(), data.dueDate.getMonth(), data.dueDate.getDate());
        const diff = target.getTime() - today.getTime();
        
        let priority: TaskPriority = 'low';
        if (diff <= 0) priority = 'high';
        else if (diff <= 86400000) priority = 'medium';

        const newTask: TaskData = {
            id: `task-${Math.random().toString(36).substr(2, 5)}`,
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

    return (
        <div className="flex flex-col h-full w-full bg-background text-foreground overflow-hidden relative">
            <div className="flex-1 overflow-hidden relative">
                <KanBanDndProvider onDealDragOver={onDealDragOver} onDealDragEnd={onDealDragEnd} dealsByColumn={dealsByColumn}>
                <KanBanBoard onAddColumn={onAddColumn}>
                    {COLUMNS.map((column) => {
                        const deals = dealsByColumn[column.id] || [];
                        const tasks = tasksByColumn[column.id] || [];

                        // Show column if it has deals, tasks, or if the user is currently adding a task to it.
                        if (deals.length === 0 && tasks.length === 0 && addingToColumn !== column.id) return null;

                        return (
                            <div key={column.id} style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
                                <div className="cashy-kanban-column-header">
                                    <ColumnHeader
                                        title={column.title}
                                        count={(deals.length + (tasksByColumn[column.id]?.length || 0))}
                                        variant="admin"
                                        onConfigClick={() => console.log('Config click')}
                                        onAddClick={() => setAddingToColumn(column.id)}
                                    />
                                </div>

                                <KanBanColumn id={column.id} dealIds={deals.map(d => d.id)}>
                                    {addingToColumn === column.id && (
                                        <TaskCreateCardLarge
                                            onAdd={(data) => handleAddTask(column.id, data)}
                                            onCancel={() => setAddingToColumn(null)}
                                        />
                                    )}

                                    {tasksByColumn[column.id]?.map(task => (
                                        <TaskCardLarge
                                            key={task.id}
                                            taskId={task.id.replace('task-', '')}
                                            title={task.title}
                                            description={task.description}
                                            dueDate={task.dueDate}
                                            priority={task.priority}
                                            assignee={task.assignee}
                                        />
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
                                                onClick={() => onSelectDeal(deal)}
                                                onArchive={() => handleArchive(deal.id)}
                                            />
                                        );
                                    })}
                                </KanBanColumn>
                            </div>
                        );
                    })}
                </KanBanBoard>
                </KanBanDndProvider>
            </div>
        </div>
    );
};
