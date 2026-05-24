import { useState, useRef, useLayoutEffect } from "react";
import "./Card.css";

export type CategoriesDealCardProps = {
  className?: string;
  categories?: string[];
};

export const CategoriesDealCard = ({
  className = "",
  categories = ["General Electronics", "Car"],
}: CategoriesDealCardProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [maxDisplay, setMaxDisplay] = useState(categories.length);

  useLayoutEffect(() => {
    if (!containerRef.current || categories.length === 0) return;

    const container = containerRef.current;
    let containerWidth = container.clientWidth;
    if (containerWidth === 0) containerWidth = container.parentElement?.clientWidth || 200;

    const plusBadgeWidth = 35; // safe width for "+X"
    const gapWidth = 2; // var(--space-050)
    
    let currentWidth = 0;
    let itemsToDisplay = 0;
    
    // Character width estimation for quick flex wrapping
    // A 10px sans-serif character is roughly 6px wide.
    const charWidth = 6;
    // Padding + Border: 7px left + 7px right + 1px borders = 15px
    const categoryPadding = 15;
    
    for (let i = 0; i < categories.length; i++) {
        const textWidth = categories[i].length * charWidth;
        const tagWidth = textWidth + categoryPadding;
        
        const requiredSpace = currentWidth + tagWidth;
        const needsBadgeSpace = i < categories.length - 1 ? plusBadgeWidth : 0;

        if (requiredSpace + needsBadgeSpace > containerWidth) {
            break;
        }
        
        currentWidth += tagWidth + gapWidth;
        itemsToDisplay++;
    }

    if (itemsToDisplay === 0 && categories.length > 0) itemsToDisplay = 1;

    setMaxDisplay(prev => prev !== itemsToDisplay ? itemsToDisplay : prev);
    
  }, [categories]);

  // Re-run measurement when the container resizes
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      setMaxDisplay(categories.length); // reset to trigger re-measure on next layout effect
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [categories.length]);

  const hiddenCount = categories.length - maxDisplay;
  const isMultiple = categories.length > maxDisplay;

  return (
    <div
      ref={containerRef}
      className={`categories-card ${
        isMultiple ? "categories-card--multiple" : "categories-card--single"
      } ${className}`}
    >
      {/* We render ALL categories initially but hide the overflow ones via CSS, 
          or we render them to measure and then slice. We slice here, so the effect 
          measures the subset. To measure ALL initially, we'd need a different pattern.
          Let's render the sliced version, but if it's not measured yet, render all. 
          Actually, a safer, simpler React pattern is to render the measured slice.
          Since the effect runs synchronously after render, we initialize with all, measure, then truncate. */}
      
      {categories.slice(0, maxDisplay === categories.length ? categories.length : maxDisplay).map((category, idx) => (
        <div key={idx} className="categories-tag">
          <div className="categories-text">
            <p>{category}</p>
          </div>
        </div>
      ))}
      
      {isMultiple && (
        <div className="categories-plus-wrapper">
          <div className="categories-plus">
            <div className="categories-text">
              <p>+{hiddenCount}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
