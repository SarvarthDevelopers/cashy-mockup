import { Fragment, useState, useRef, useCallback, useEffect } from "react";
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

  const recalculate = useCallback(() => {
    if (!containerRef.current || items.length === 0) return;

    const container = containerRef.current;
    let containerWidth = container.clientWidth;
    const plusBadgeWidth = 25;

    if (containerWidth === 0) {
      containerWidth = container.parentElement?.clientWidth || 200;
    }

    let itemsToDisplay = 0;
    const charWidth = 5.5;
    const gapWidth = 2;
    const commaWidth = 4;
    let currentWidth = 0;

    for (let i = 0; i < items.length; i++) {
      const isLastOverall = i === items.length - 1;
      const itemTextWidth = items[i].length * charWidth;
      const totalItemWidth = itemTextWidth + (isLastOverall ? 0 : commaWidth);
      const requiredSpace = currentWidth + totalItemWidth;
      const needsBadgeSpace = !isLastOverall ? plusBadgeWidth : 0;

      if (requiredSpace + needsBadgeSpace > containerWidth) {
        break;
      }

      currentWidth += totalItemWidth + gapWidth;
      itemsToDisplay++;
    }

    if (itemsToDisplay === 0 && items.length > 0) itemsToDisplay = 1;

    setMaxDisplay(prev => prev !== itemsToDisplay ? itemsToDisplay : prev);
  }, [items]);

  useEffect(() => {
    recalculate();
    const observer = new ResizeObserver(recalculate);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [recalculate]);

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
