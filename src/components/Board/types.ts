import type { ReactNode } from 'react';

export interface ColumnConfig {
  id: string;
  title: string;
  color?: string; // Hex color string, e.g. '#EF4544'
  sortBy?: 'dueDate' | 'amount' | 'customerName' | 'id' | 'manual';
  sortOrder?: 'asc' | 'desc';
  visibleToPartners?: boolean;
  visibleToShops?: string[]; // array of shop names, e.g. ['AT / Wein', 'AT / Graz', 'DE / Berlin']
  focused?: boolean; // When true, the column displays a focus ring
}

export interface KanBanBoardProps {
  /**
   * The columns to render within the KanBan board.
   * Expects nodes containing ColumnHeader and Card components.
   */
  children?: ReactNode;
  /**
   * Optional custom CSS class for the board container
   */
  className?: string;
  /**
   * Callback fired when a user clicks the "Add Column" plus button
   * injected between columns on hover.
   */
  onAddColumn?: (index: number) => void;
}
