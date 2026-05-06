import { Fragment, useState, useRef, useLayoutEffect } from "react";
import "./Card.css";

export type ItemsDealCardProps = {
  className?: string;
  items?: string[];
};

export const ItemsDealCard = ({
  className = "",
  items = ["Item 1", "Item 2"],
}: ItemsDealCardProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [maxDisplay, setMaxDisplay] = useState(items.length);

  useLayoutEffect(() => {
    if (!containerRef.current || items.length === 0) return;

    const container = containerRef.current;
    let containerWidth = container.clientWidth;
    const plusBadgeWidth = 25; // Narrower safe width for +X
    
    // Safety check because sometimes clientWidth is 0 on first tick in flex containers
    if (containerWidth === 0) {
        // Try getting parent width if it's fluid
        containerWidth = container.parentElement?.clientWidth || 200; 
    }

    let itemsToDisplay = 0;
    
    // We use a highly performant character width estimation.
    // An average character in 10px Inter is ~5.5px wide.
    const charWidth = 5.5;
    const gapWidth = 2; // flex gap: var(--space-050)
    const commaWidth = 4; // ', ' width
    let currentWidth = 0;

    for (let i = 0; i < items.length; i++) {
        // Text node width + the trailing comma if it's not the last visible item
        const isLastOverall = (i === items.length - 1);
        const itemTextWidth = items[i].length * charWidth;
        const totalItemWidth = itemTextWidth + (isLastOverall ? 0 : commaWidth);
        const requiredSpace = currentWidth + totalItemWidth;
        
        // If this isn't the final item, we must leave room for the "+X" badge
        const needsBadgeSpace = !isLastOverall ? plusBadgeWidth : 0;

        if (requiredSpace + needsBadgeSpace > containerWidth) {
            break; // Stop adding items
        }

        currentWidth += totalItemWidth + gapWidth;
        itemsToDisplay++;
    }

    if (itemsToDisplay === 0 && items.length > 0) itemsToDisplay = 1;

    setMaxDisplay(prev => prev !== itemsToDisplay ? itemsToDisplay : prev);
  }, [items, containerRef.current?.clientWidth]);

  if (!items || items.length === 0) return null;

  const visibleItems = items.slice(0, maxDisplay);
  const hiddenCount = items.length - maxDisplay;
  const isMultiple = items.length > maxDisplay;

  return (
    <div ref={containerRef} className={`items-card ${className}`}>
      {visibleItems.map((item, idx) => (
         <Fragment key={idx}>
          <div className="items-text">
            <p>{item}{(idx < visibleItems.length - 1 || isMultiple) ? ',' : ''}</p>
          </div>
        </Fragment>
      ))}
      
      {isMultiple && (
        <div className="items-plus-container">
          <div className="items-text">
            <p>+{hiddenCount}</p>
          </div>
        </div>
      )}
    </div>
  );
};
