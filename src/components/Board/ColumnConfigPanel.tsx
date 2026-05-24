import React from 'react';
import { Input } from '../Input/Input';
import { ColorPicker } from '../ColorPicker/ColorPicker';
import { Dropdown } from '../Dropdown/Dropdown';
import { Toggle } from '../Toggle/Toggle';
import { Checkbox } from '../Checkbox/Checkbox';
import { Button } from '../Button/Button';
import type { ColumnConfig } from './types';
import './ColumnConfigPanel.css';

export interface ColumnConfigPanelProps {
  column: ColumnConfig;
  onChange: (updatedColumn: ColumnConfig) => void;
  onClose: () => void;
  onDelete: () => void;
}

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ marginRight: '6px' }}>
    <path 
      d="M2.5 4h11M5.833 4V2.667c0-.368.146-.72.406-.98a1.385 1.385 0 0 1 .981-.407h1.56c.368 0 .72.146.98.406c.26.26.406.613.406.981V4m-6.5 2.5v6c0 .368.146.72.406.98c.26.26.613.406.981.406h4.666c.368 0 .72-.146.98-.406c.26-.26.406-.613.406-.981v-6" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export const ColumnConfigPanel: React.FC<ColumnConfigPanelProps> = ({
  column,
  onChange,
  onClose,
  onDelete
}) => {
  const handleFieldChange = <K extends keyof ColumnConfig>(key: K, value: ColumnConfig[K]) => {
    onChange({
      ...column,
      [key]: value
    });
  };

  const handleShopChange = (shop: string, checked: boolean) => {
    const currentShops = column.visibleToShops || [];
    const nextShops = checked 
      ? [...currentShops, shop] 
      : currentShops.filter(s => s !== shop);
    handleFieldChange('visibleToShops', nextShops);
  };

  const sortOptions = [
    { label: 'Due Date (Default)', value: 'dueDate' },
    { label: 'Amount', value: 'amount' },
    { label: 'Customer Name', value: 'customerName' },
    { label: 'ID', value: 'id' },
    { label: 'Manual Order', value: 'manual' }
  ];

  const orderOptions = [
    { label: 'Descending (Default)', value: 'desc' },
    { label: 'Ascending', value: 'asc' }
  ];

  const shopsList = ['AT / Wein', 'AT / Graz', 'DE / Berlin'];

  return (
    <div className="cashy-column-config" data-testid="cashy-column-config">
      <div className="cashy-column-config__body">
        {/* Title */}
        <h4 className="cashy-column-config__title">Column Configuration</h4>
        <hr className="cashy-column-config__divider" />

        {/* Name input */}
        <div className="cashy-column-config__section">
          <Input
            label="Name"
            value={column.title}
            onChange={(e) => handleFieldChange('title', e.target.value.slice(0, 18))}
            placeholder="Enter column name"
            helperText="Maximum 18 characters"
            maxLength={18}
          />
        </div>

        {/* Color Picker */}
        <div className="cashy-column-config__section">
          <ColorPicker
            value={column.color || ''}
            onChange={(color) => handleFieldChange('color', color)}
            label="Column Colour"
          />
        </div>
        <hr className="cashy-column-config__divider" />

        {/* Sorting Dropdowns */}
        <div className="cashy-column-config__section">
          <Dropdown
            label="Sort cards by"
            options={sortOptions}
            value={column.sortBy || 'dueDate'}
            onChange={(val) => handleFieldChange('sortBy', val as ColumnConfig['sortBy'])}
          />
        </div>

        <div className="cashy-column-config__section">
          <Dropdown
            label="Sorting order"
            options={orderOptions}
            value={column.sortOrder || 'desc'}
            onChange={(val) => handleFieldChange('sortOrder', val as ColumnConfig['sortOrder'])}
          />
        </div>
        <hr className="cashy-column-config__divider" />

        {/* Visible to Partners Toggle */}
        <div className="cashy-column-config__section">
          <Toggle
            label="Visible to Partners?"
            description="Enable or disable visibility of this column for Partner accounts."
            labelPosition="left"
            checked={column.visibleToPartners ?? true}
            onChange={(e) => handleFieldChange('visibleToPartners', e.target.checked)}
          />
        </div>
        <hr className="cashy-column-config__divider" />

        {/* Visible to Shops Checkboxes */}
        <div className="cashy-column-config__section">
          <span className="cashy-column-config__subtitle">Visible to Shops:</span>
          <div className="cashy-column-config__checkbox-group">
            {shopsList.map((shop) => {
              const isChecked = (column.visibleToShops || []).includes(shop);
              return (
                <Checkbox
                  key={shop}
                  label={shop}
                  checked={isChecked}
                  onChange={(e) => handleShopChange(shop, e.target.checked)}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="cashy-column-config__footer">
        <Button
          variant="danger-subtle"
          onClick={onDelete}
          className="cashy-column-config__delete-btn"
          aria-label="Delete Column"
        >
          <TrashIcon />
          Delete Column
        </Button>
        <Button
          variant="primary"
          onClick={onClose}
          className="cashy-column-config__close-btn"
          aria-label="Close"
        >
          Close
        </Button>
      </div>
    </div>
  );
};
