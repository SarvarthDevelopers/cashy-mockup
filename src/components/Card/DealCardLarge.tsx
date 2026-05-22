import React, { useState, useRef, useEffect } from 'react';
import "./Card.css";
import { ShopLabel } from "./ShopLabel";
import { CategoriesDealCard } from "./CategoriesDealCard";
import { ItemsDealCard } from "./ItemsDealCard";
import { Priority } from "./Priority";
import type { PriorityProps } from "./Priority";
import type { ShopLabelProps } from "./ShopLabel";

export type DealCardLargeProps = {
  className?: string;
  amount?: string;
  bookingNo?: string;
  customerName?: string;
  dueDate?: string;
  priority?: boolean;
  state?: "Default" | "Hover" | "Selected";
  
  // Props drilling down to children for Storybook ease
  priorityType?: PriorityProps["type"];
  shopLabelColor?: ShopLabelProps["color"];
  shopLabelCountry?: string;
  shopLabelBranch?: string;
  items?: string[];
  categories?: string[];
  
  onClick?: () => void;
  onArchive?: () => void;
};

export const DealCardLarge = React.forwardRef<HTMLDivElement, DealCardLargeProps>(({
  className = "",
  amount = "€6,540",
  bookingNo = "123456",
  customerName = "Komsi Ogli",
  dueDate = "Due Jan 19",
  priority = true,
  state = "Default",
  priorityType = "Highest",
  shopLabelColor,
  shopLabelCountry = "AT",
  shopLabelBranch = "Wien",
  items = ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"],
  categories = ["General Electronics", "Car", "Jewelry", "Home"],
  onClick,
  onArchive,
}, ref) => {
  const stateClass = state !== "Default" ? `deal-card--${state.toLowerCase()}` : "";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handler);
    }
    return () => document.removeEventListener('mousedown', handler);
  }, [isMenuOpen]);

  let displayDate = dueDate;
  if (!isNaN(Number(dueDate)) && dueDate.length > 8) {
      const date = new Date(Number(dueDate));
      displayDate = `Due ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  }

  return (
    <div ref={ref} className={`deal-card ${stateClass} ${className}`} onClick={onClick} tabIndex={0}>
      {/* Header Row */}
      <div className="deal-card-row deal-card-row--header">
        <div className="deal-card-left">
          <div className="deal-card-header-left">
            <ShopLabel 
              color={shopLabelColor} 
              country={shopLabelCountry} 
              branch={shopLabelBranch} 
            />
            <div className="deal-card-booking-no">{bookingNo}</div>
          </div>
        </div>
        <div className="deal-card-right">
          <div className="deal-card-header-right-container">
            <div 
              className="deal-card-more-button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              role="button"
              aria-label="More options"
              aria-expanded={isMenuOpen}
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm5 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm5 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            {isMenuOpen && (
              <div 
                ref={menuRef}
                className="deal-card-context-menu"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="deal-card-context-menu-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive?.();
                    setIsMenuOpen(false);
                  }}
                >
                  Archive Deal
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Row */}
      <div className="deal-card-row deal-card-row--customer">
        <div className="deal-card-customer-left">
          <div className="deal-card-customer-name">{customerName}</div>
        </div>
        {priority && (
          <div className="deal-card-right">
            <Priority type={priorityType} />
          </div>
        )}
      </div>

      {/* Items & Due Date Row */}
      <div className="deal-card-row deal-card-row--items">
        <div className="deal-card-left">
          <div className="deal-card-items-left">
            <ItemsDealCard items={items} />
          </div>
        </div>
        <div className="deal-card-right">
           <div className="deal-card-due-date">{displayDate}</div>
        </div>
      </div>

      {/* Footer / Categories / Amount Row */}
      <div className="deal-card-row deal-card-row--footer">
          <div className="deal-card-footer-left-wrap">
              <div className="deal-card-footer-left">
                  <CategoriesDealCard categories={categories} />
              </div>
          </div>
          <div className="deal-card-footer-right-wrap">
              <div className="deal-card-amount">{amount}</div>
          </div>
      </div>
    </div>
  );
});

DealCardLarge.displayName = 'DealCardLarge';
