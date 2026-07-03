import { useRef, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import svgPaths from "../../imports/svg-4o201vrq4p";
import type { Step } from './DealWizardBuilder';
import { getWorkflowGates } from '../../data/workflowGates';
import type { WorkflowGate } from '../../data/workflowGates';

interface DraggableStepTabProps {
  step: Step;
  index: number;
  isActive: boolean;
  onClick: () => void;
  onReorder: (dragIndex: number, hoverIndex: number) => void;
  gates?: WorkflowGate[];
}

const ITEM_TYPE = 'STEP_TAB';

export function DraggableStepTab({ step, index, isActive, onClick, onReorder, gates }: DraggableStepTabProps) {
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
    const activeGates = gates || getWorkflowGates();
    const gate = activeGates.find(g => g.id === step.associatedAction);
    if (!gate) return null;

    const firstTrigger = gate.triggers[0] || '';
    let colorClass = 'bg-gray-400';
    if (firstTrigger === 'REVIEWING') colorClass = 'bg-amber-500';
    else if (firstTrigger === 'VERIFIED') colorClass = 'bg-[#4649E5]';
    else if (firstTrigger === 'PAYED_AND_STORED') colorClass = 'bg-emerald-500';
    else if (firstTrigger === 'DECLINED') colorClass = 'bg-rose-500';
    else if (firstTrigger === 'CANCELED') colorClass = 'bg-red-500';
    else if (firstTrigger === 'CLOSED') colorClass = 'bg-zinc-600';
    else if (firstTrigger === 'ON_SELL') colorClass = 'bg-purple-500';
    else if (firstTrigger === 'ITEM_RECEIVED_ID_MISSING') colorClass = 'bg-orange-500';

    return (
      <span 
        title={`Deal Checkpoint: ${gate.name}`}
        className={`w-2 h-2 rounded-full ${colorClass} shrink-0`} 
      />
    );
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
