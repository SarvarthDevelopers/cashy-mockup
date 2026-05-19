import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DealCardLarge, type DealCardLargeProps } from './DealCardLarge';

export type DraggableDealCardProps = DealCardLargeProps & {
  dealId: string;
};

export const DraggableDealCard = React.forwardRef<HTMLDivElement, DraggableDealCardProps>(({ dealId, ...props }, ref) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: dealId,
    data: {
      type: 'DealCard',
      dealId: dealId
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 250ms cubic-bezier(0.2, 0, 0, 1)',
  };

  // We merge the incoming ref with the dnd-kit nodeRef
  const setRefs = (element: HTMLDivElement | null) => {
    setNodeRef(element);
    if (typeof ref === 'function') {
      ref(element);
    } else if (ref) {
      (ref as React.MutableRefObject<HTMLDivElement | null>).current = element;
    }
  };

  return (
    <div
      ref={setRefs}
      style={style}
      {...listeners}
      {...attributes}
      className={isDragging ? 'deal-card-wrapper--dragging' : ''}
    >
      <DealCardLarge
        {...props}
        className={`${props.className || ''} ${isDragging ? 'deal-card--dragging' : ''}`}
      />
    </div>
  );
});

DraggableDealCard.displayName = 'DraggableDealCard';
