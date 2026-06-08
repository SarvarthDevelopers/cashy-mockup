import { useRef, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import svgPaths from "../../imports/svg-4o201vrq4p";
import type { Step } from './DealWizardBuilder';

interface DraggableStepTabProps {
  step: Step;
  index: number;
  isActive: boolean;
  onClick: () => void;
  onReorder: (dragIndex: number, hoverIndex: number) => void;
}

const ITEM_TYPE = 'STEP_TAB';

export function DraggableStepTab({ step, index, isActive, onClick, onReorder }: DraggableStepTabProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
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

      onReorder(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  useEffect(() => {
    drag(drop(ref));
  }, [drag, drop]);

  const getActionIndicator = () => {
    if (!step.associatedAction || step.associatedAction === 'NONE') return null;
    switch (step.associatedAction) {
      case 'SET_REVIEWING':
        return (
          <span 
            title="Workflow Gate: Start Review"
            className="w-2 h-2 rounded-full bg-amber-500 shrink-0" 
          />
        );
      case 'VERIFY_DEAL':
        return (
          <span 
            title="Workflow Gate: Verify Deal"
            className="w-2 h-2 rounded-full bg-[#4649E5] shrink-0" 
          />
        );
      case 'EXECUTE_PAYOUT':
        return (
          <span 
            title="Workflow Gate: Execute Payout"
            className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" 
          />
        );
      case 'DECLINE_DEAL':
        return (
          <span 
            title="Workflow Gate: Decline Deal"
            className="w-2 h-2 rounded-full bg-rose-500 shrink-0" 
          />
        );
      default:
        return null;
    }
  };

  return (
    <div ref={ref} className="shrink-0" style={{ opacity: isDragging ? 0.5 : 1 }}>
      <button
        onClick={onClick}
        className={`
          ${isActive ? 'bg-[var(--background-brand-solid)] border-[var(--background-brand-solid)]' : 'bg-[var(--background-primary)] border border-[var(--border-subtle)]'}
          rounded-[8px] h-[40px] px-[16px] transition-all flex items-center gap-[10px] cursor-move shrink-0 whitespace-nowrap shadow-sm hover:shadow-md hover:border-[var(--border-brand-hover)]
        `}
      >
        <div className="flex items-center gap-2">
          {getActionIndicator()}
          <span 
            className={`font-['Inter',sans-serif] font-bold text-[14px] whitespace-nowrap shrink-0 leading-[1.2] ${isActive ? 'text-[var(--text-white)]' : 'text-[var(--text-primary)]'}`}
          >
            {step.name}
          </span>
          <svg 
            width="10" 
            height="14" 
            viewBox="0 0 8.33333 11.6667" 
            fill="none"
            className="shrink-0 opacity-40"
          >
            <path d={svgPaths.pec0fb80} fill={isActive ? "#fff" : "var(--text-subtle)"} />
          </svg>
        </div>
      </button>
    </div>
  );
}
