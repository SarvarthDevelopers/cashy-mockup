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
    const clickHandler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', clickHandler);
      document.addEventListener('keydown', keyHandler);
    }
    return () => {
      document.removeEventListener('mousedown', clickHandler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [isMenuOpen]);

  let displayDate = dueDate;
  if (dueDate) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      const [year, month, day] = dueDate.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      displayDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } else if (!isNaN(Number(dueDate)) && dueDate.length > 8) {
      const date = new Date(Number(dueDate));
      displayDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } else {
      const timestamp = Date.parse(dueDate);
      if (!isNaN(timestamp) && (dueDate.includes('T') || dueDate.includes('-'))) {
        const date = new Date(timestamp);
        displayDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      // Don't trigger click if it comes from the more button
      if ((e.target as HTMLElement).closest('.deal-card-more-button')) return;
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div 
      ref={ref} 
      className={`deal-card ${stateClass} ${className} focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4649e5] focus-visible:ring-offset-2`} 
      onClick={onClick} 
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
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
            <button 
              type="button"
              className="deal-card-more-button focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4649e5]"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
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
            </button>
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
