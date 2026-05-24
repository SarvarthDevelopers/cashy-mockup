import { useRef, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import type { Field } from './DealWizardBuilder';
import { FieldItem } from './FieldItem';

interface DraggableFieldItemProps {
  field: Field;
  index: number;
  onRemove: (fieldId: string) => void;
  onUpdate: (fieldId: string, updates: Partial<Field>) => void;
  onReorder: (dragIndex: number, hoverIndex: number, stepId: string) => void;
  stepId: string;
  isSelected?: boolean;
  onSelect?: () => void;
}

const ITEM_TYPE = 'FIELD_ITEM';

export function DraggableFieldItem({ field, index, onRemove, onUpdate, onReorder, stepId, isSelected, onSelect }: DraggableFieldItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: ITEM_TYPE,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ITEM_TYPE,
    hover: (item: { index: number }) => {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      onReorder(dragIndex, hoverIndex, stepId);
      item.index = hoverIndex;
    },
  });

  useEffect(() => {
    preview(drop(ref));
  }, [preview, drop]);

  return (
    <div ref={ref} className="w-full" style={{ opacity: isDragging ? 0.5 : 1 }}>
      <FieldItem
        field={field}
        onRemove={onRemove}
        onUpdate={onUpdate}
        isSelected={isSelected}
        onSelect={onSelect}
        dragHandleRef={drag}
      />
    </div>
  );
}