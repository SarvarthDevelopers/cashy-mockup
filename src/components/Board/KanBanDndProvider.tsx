import React, { useState } from 'react';
import {
  DndContext,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent
} from '@dnd-kit/core';
import type { ColumnId, DealData } from '../../data/mockData';
import { DealCardLarge } from '../Card/DealCardLarge';

interface KanBanDndProviderProps {
  children: React.ReactNode;
  onDealDragOver: (dealId: string, fromColumn: ColumnId, toColumn: ColumnId, toIndex: number) => void;
  onDealDragEnd: (columnId: ColumnId, oldIndex: number, newIndex: number) => void;
  dealsByColumn: Record<ColumnId, DealData[]>;
  onDragEndComplete?: (dealId: string) => void;
}

export const KanBanDndProvider: React.FC<KanBanDndProviderProps> = ({ children, onDealDragOver, onDealDragEnd, dealsByColumn, onDragEndComplete }) => {
  const [activeDeal, setActiveDeal] = useState<DealData | null>(null);

  const findColumn = (id: string): ColumnId | null => {
    if (id in dealsByColumn) return id as ColumnId;
    for (const colId in dealsByColumn) {
      if (dealsByColumn[colId as ColumnId].find(d => d.id === id)) {
        return colId as ColumnId;
      }
    }
    return null;
  };

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const dealId = active.id as string;
    
    // Find the deal data so we can render it in the DragOverlay
    let foundDeal: DealData | null = null;
    for (const colId in dealsByColumn) {
      const deal = dealsByColumn[colId as ColumnId].find(d => d.id === dealId);
      if (deal) {
        foundDeal = deal;
        break;
      }
    }
    setActiveDeal(foundDeal);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findColumn(activeId);
    const overColumn = findColumn(overId) || (overId as ColumnId);

    if (!activeColumn || !overColumn || activeColumn === overColumn) {
      return;
    }

    const overItems = dealsByColumn[overColumn] || [];
    const overIndex = overItems.findIndex(d => d.id === overId);
    
    let newIndex;
    if (overIndex >= 0) {
      const isBelowOverItem =
        over &&
        active?.rect?.current?.translated &&
        over?.rect &&
        active.rect.current.translated.top > over.rect.top + over.rect.height;
      
      const modifier = isBelowOverItem ? 1 : 0;
      newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
    } else {
      newIndex = overItems.length;
    }

    onDealDragOver(activeId, activeColumn, overColumn as ColumnId, newIndex);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDeal(null);
    const { active, over } = event;
    const activeId = active.id as string;

    if (activeId) {
      onDragEndComplete?.(activeId);
    }

    if (!over) return;

    const overId = over.id as string;
    
    const activeColumn = findColumn(activeId);
    const overColumn = findColumn(overId) || (overId as ColumnId);

    if (!activeColumn || !overColumn || activeColumn !== overColumn) {
      return;
    }

    const activeItems = dealsByColumn[activeColumn] || [];
    const overItems = dealsByColumn[overColumn] || [];

    const activeIndex = activeItems.findIndex(d => d.id === activeId);
    const overIndex = overItems.findIndex(d => d.id === overId);

    if (activeIndex !== overIndex) {
      onDealDragEnd(activeColumn, activeIndex, overIndex);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {activeDeal ? (
          <div className="deal-card-wrapper--drag-overlay">
            <DealCardLarge
              className="deal-card--drag-overlay"
              bookingNo={`#${activeDeal.id}`}
              customerName={`${activeDeal.firstName} ${activeDeal.lastName}`}
              amount={activeDeal.amount || ''}
              dueDate={activeDeal.dueDate || activeDeal.appointmentDate || 'No Date'}
              priority={activeDeal.flags?.includes('HIGH VALUE')}
              priorityType={activeDeal.flags?.includes('HIGH VALUE') ? "Highest" : "Medium"}
              shopLabelCountry={activeDeal.countryCode}
              shopLabelBranch={activeDeal.branch}
              items={activeDeal.items}
              categories={[activeDeal.businessArea || 'General']}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
