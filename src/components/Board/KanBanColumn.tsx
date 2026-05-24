import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

export interface KanBanColumnProps {
  id: string;
  dealIds: string[];
  children: React.ReactNode;
}

export const KanBanColumn: React.FC<KanBanColumnProps> = ({ id, dealIds, children }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
    data: {
      type: 'Column',
      columnId: id
    }
  });

  return (
    <div
      ref={setNodeRef}
      className={`cashy-kanban-column-body ${isOver ? 'cashy-kanban-column-body--drop-target' : ''}`}
    >
      <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </div>
  );
};
