import React, { useState } from 'react';
import { KanBanBoard } from '../components/Board/KanBanBoard';
import { KanBanDndProvider } from '../components/Board/KanBanDndProvider';
import { KanBanColumn } from '../components/Board/KanBanColumn';
import { ColumnHeader } from '../components/ColumnHeader/ColumnHeader';
import { DraggableDealCard } from '../components/Card/DraggableDealCard';
import type { DealData } from '../data/mockData';
import { TaskCardLarge, type TaskPriority } from '../components/TaskCard/TaskCardLarge';
import { TaskCreateCardLarge } from '../components/TaskCard/TaskCreateCardLarge';
import { useToast } from '../components/Toast/ToastContext';
import type { ColumnConfig } from '../components/Board/types';
import { ColumnConfigPanel } from '../components/Board/ColumnConfigPanel';

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
    const [activeConfigColumnId, setActiveConfigColumnId] = useState<string | null>(null);
    const { showToast } = useToast();

    const handleAddColumn = (index: number) => {
        const newId = onAddColumn(index);
        if (newId) {
            showToast('New column added successfully.', 'success');
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
        <div className="flex flex-col h-full w-full bg-background text-foreground overflow-hidden relative" onClick={onClearColumnsFocus}>
            <div className="flex-1 overflow-hidden relative">
                <KanBanDndProvider onDealDragOver={onDealDragOver} onDealDragEnd={onDealDragEnd} dealsByColumn={dealsByColumn} onDragEndComplete={onDragEndComplete}>
                <KanBanBoard onAddColumn={handleAddColumn}>
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
                                        onDelete={() => {
                                            onDeleteColumn(column.id);
                                            setActiveConfigColumnId(null);
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
            </div>
        </div>
    );
};
