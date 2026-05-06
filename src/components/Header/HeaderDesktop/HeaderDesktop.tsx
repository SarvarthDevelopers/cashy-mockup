import React from 'react';
import './HeaderDesktop.css';
import type { HeaderDesktopProps, HeaderNavItem } from './types';

export const HeaderDesktop = React.forwardRef<HTMLElement, HeaderDesktopProps>(({
  className = '',
  logo,
  navItems = [],
  actions,
  primaryAction,
  style,
}, ref) => {
  return (
    <header ref={ref} className={`cashy-header ${className}`} style={style}>
      <div className="cashy-header-left">
        {logo && (
          <div className="cashy-header-logo">
            {logo}
          </div>
        )}

        {navItems.length > 0 && (
          <nav className="cashy-header-nav">
            {navItems.map((item: HeaderNavItem, index: number) => (
              <a
                key={index}
                href={item.href}
                className="cashy-header-nav-item"
                onClick={item.onClick}
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}
      </div>

      <div className="cashy-header-right">
        {(primaryAction || actions) && (
          <div className="cashy-header-buttons-group">
            {primaryAction && (
              <button type="button" className="cashy-header-primary-btn">
                {primaryAction}
              </button>
            )}
            
            {actions && (
              <div className="cashy-header-icon-btn-group">
                {actions}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
});

HeaderDesktop.displayName = 'HeaderDesktop';
