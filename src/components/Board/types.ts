import type { ReactNode } from 'react';

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
