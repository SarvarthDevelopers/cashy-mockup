import type { ReactNode } from "react";

export interface HeaderNavItem {
  label: string;
  onClick?: () => void;
  href?: string;
}

export interface HeaderDesktopProps {
  /**
   * Optional custom class name for the root outer container.
   */
  className?: string;
  /**
   * The logo element to render on the far left. Typically an SVG or an Image component.
   */
  logo?: ReactNode;
  /**
   * The list of navigation items displayed in the center menu area.
   */
  navItems?: HeaderNavItem[];
  /**
   * Action buttons rendered on the right side.
   * Based on the design, it contains a primary button and up to 3 icon buttons.
   */
  actions?: ReactNode;
  /**
   * The primary call-to-action button or text rendered inside the distinct primary button block.
   */
  primaryAction?: ReactNode;
  /**
   * Optional inline styles for the root container.
   */
  style?: React.CSSProperties;
}
