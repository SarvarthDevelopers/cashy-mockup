import React, { Children } from 'react';
import type { KanBanBoardProps } from './types';
import { PlusIcon } from '../ColumnHeader/icons/PlusIcon';
import { Tooltip } from '../Tooltip/Tooltip';
import './KanBanBoard.css';

/**
 * KanBanBoard Container Component
 * 
 * Provides the horizontal scrolling and standardized column gaps,
 * adhering to the Cashy Design System constraints for board layouts.
 */
export const KanBanBoard = React.forwardRef<HTMLDivElement, KanBanBoardProps>(({
  children,
  className = '',
  onAddColumn
}, ref) => {
  const childArray = Children.toArray(children);

  return (
    <div 
      ref={ref}
      className={`cashy-kanban-board ${className}`} 
      data-testid="cashy-kanban-board"
    >
      {/* Leading Interaction Zone & Pad Spacer */}
      <div className="cashy-kanban-interaction-zone">
        {onAddColumn && (
          <Tooltip content="Add column" side="bottom">
            <button 
              className="cashy-kanban-add-btn" 
              onClick={(e) => {
                  e.stopPropagation();
                  onAddColumn(0);
              }}
              aria-label="Add Column Left"
            >
              <PlusIcon />
            </button>
          </Tooltip>
        )}
      </div>

      {childArray.map((child, index) => {
        const isFocused = React.isValidElement(child) && (child.props as { focused?: boolean }).focused;
        const columnClassName = `cashy-kanban-column ${isFocused ? 'cashy-kanban-column--focused' : ''}`;

        return (
          <React.Fragment key={index}>
            <div className={columnClassName}>
              {child}
            </div>
          
          {/* Trailing Interaction Zone */}
          <div className="cashy-kanban-interaction-zone">
            {onAddColumn && (
              <Tooltip content="Add column" side="bottom">
                <button 
                  className="cashy-kanban-add-btn" 
                  onClick={(e) => {
                      e.stopPropagation();
                      onAddColumn(index + 1);
                  }}
                  aria-label="Add Column Right"
                >
                  <PlusIcon />
                </button>
              </Tooltip>
            )}
          </div>
        </React.Fragment>
      )})}
    </div>
  );
});

KanBanBoard.displayName = 'KanBanBoard';
