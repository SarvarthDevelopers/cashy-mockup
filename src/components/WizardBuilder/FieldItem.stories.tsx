import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';

import { FieldItem, type FieldItemData, type FieldType } from './FieldItem';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { TextArea } from '../TextArea/TextArea';
import { Dropdown as DropdownComponent } from '../Dropdown/Dropdown';
import { Checkbox as CheckboxComponent } from '../Checkbox/Checkbox';
import { Radio } from '../Radio/Radio';
import { RadioGroup } from '../Radio/RadioGroup';
import { Toggle as ToggleComponent } from '../Toggle/Toggle';

// ─── Deal Wizard (End-User) Field Render ─────────────────────────────────────

const DealWizardField = ({ field }: { field: FieldItemData }) => {
  const { fieldType, label, helpText, required, placeholder, options, buttonLabel } = field;
  
  const renderInput = () => {
    switch (fieldType.type) {
      case 'textarea':
        return (
          <TextArea 
            placeholder={placeholder} 
            helperText={helpText}
            required={required}
          />
        );
      case 'dropdown':
        return (
          <DropdownComponent 
            options={(options || []).map(opt => ({ label: opt, value: opt }))}
            placeholder={placeholder || 'Select option'}
            helperText={helpText}
            required={required}
          />
        );
      case 'checkbox':
        return (
          <div className="dw-options-grid">
            {!field.allowMultiple ? (
              <RadioGroup name={field.id}>
                {options?.map((opt, i) => (
                  <Radio key={i} label={opt} value={opt} />
                ))}
              </RadioGroup>
            ) : (
              options?.map((opt, i) => (
                <CheckboxComponent key={i} label={opt} name={field.id} />
              ))
            )}
          </div>
        );
      case 'file':
      case 'image':
        return (
          <div className="dw-upload-zone">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <div className="fi-info__title" style={{ marginBottom: '4px' }}>{label}</div>
              <div className="fi-info__subtitle">
                Max size: {field.maxFileSize || 5}MB
                {field.acceptedFormats && ` • Allowed: ${field.acceptedFormats}`}
              </div>
            </div>
            <Button variant="secondary" size="small">{buttonLabel || 'Upload File'}</Button>
          </div>
        );
      case 'toggle':
        return <ToggleComponent label={label} description={helpText} />;
      case 'date':
        return (
          <Input 
            type="date" 
            placeholder={placeholder} 
            helperText={helpText}
            required={required}
          />
        );
      case 'url':
        return (
          <Input 
            type="url" 
            placeholder={placeholder || 'https://'} 
            helperText={helpText}
            required={required}
          />
        );
      default:
        return (
          <Input 
            type="text" 
            placeholder={placeholder} 
            helperText={helpText}
            required={required}
          />
        );
    }
  };

  return (
    <div className="dw-field">
      {fieldType.type !== 'toggle' && (
        <label className="dw-label">
          {label}
          {required && <span className="dw-required-star">*</span>}
        </label>
      )}
      {renderInput()}
      {/* helpText is now handled by the components themselves via helperText prop where applicable */}
    </div>
  );
};

// ─── Dual View Wrapper ───────────────────────────────────────────────────────

const DualView = ({ children, field }: { children: React.ReactNode, field: FieldItemData }) => (
  <div className="fi-dual-view">
    <div className="fi-preview-section">
      <div className="fi-section-header">
        <span className="fi-section-badge fi-section-badge--builder">🏗 Wizard Builder</span>
      </div>
      {children}
    </div>
    
    <div className="fi-divider">
      <div className="fi-divider__line" />
      <span className="fi-divider__text">End-User Preview</span>
      <div className="fi-divider__line" />
    </div>

    <div className="fi-preview-section">
      <div className="fi-section-header">
        <span className="fi-section-badge fi-section-badge--preview">✨ Deal Wizard Preview</span>
      </div>
      <div style={{ padding: '24px', background: 'var(--background-primary)', border: '1px solid var(--border-subtle)', borderRadius: '12px' }}>
        <DealWizardField field={field} />
      </div>
    </div>
  </div>
);

// ─── Shared decorator: consistent with project standard ─────────────────────

const meta: Meta<typeof FieldItem> = {
  title: 'Wizard Builder/FieldItem',
  component: FieldItem,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '90vw', maxWidth: '800px' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    isSelected: { control: 'boolean' },
    onSelect: { action: 'onSelect' },
    onRemove: { action: 'onRemove' },
    onUpdate: { action: 'onUpdate' },
    field: { table: { disable: true } },
  },
  render: function Render(args) {
    const [{ field, isSelected }, updateArgs] = useArgs();
    
    const handleUpdate = (id: string, updates: Partial<FieldItemData>) => {
      updateArgs({ field: { ...field, ...updates } });
      args.onUpdate?.(id, updates);
    };

    return (
      <DualView field={field}>
        <FieldItem 
          {...args} 
          field={field} 
          isSelected={isSelected}
          onSelect={() => updateArgs({ isSelected: !isSelected })}
          onUpdate={handleUpdate} 
        />
      </DualView>
    );
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ━━━━━━ MOCK DATA GENERATOR ━━━━━━

const createField = (type: FieldType, label: string, extra = {}): FieldItemData => ({
  id: `field-${Math.random().toString(36).substr(2, 9)}`,
  fieldType: { type, label: type.charAt(0).toUpperCase() + type.slice(1), icon: type },
  label,
  placeholder: 'Enter value',
  required: false,
  expanded: false,
  acceptedFormats: type === 'image' ? '.jpg, .png, .jpeg' : undefined,
  ...extra,
});

// ━━━━━━ STORIES (ALL 9 TYPES) ━━━━━━

export const TextInput: Story = {
  args: { field: createField('text', 'Full Name') }
};

export const Textarea: Story = {
  args: { field: createField('textarea', 'Biography') }
};

export const Dropdown: Story = {
  args: { field: createField('dropdown', 'Country', { options: ['USA', 'India', 'Germany'], placeholder: 'Select country' }) }
};

export const Checkbox: Story = {
  args: { field: createField('checkbox', 'Interests', { options: ['Art', 'Tech', 'Music'] }) }
};

export const FileUpload: Story = {
  args: { field: createField('file', 'Resume', { buttonLabel: 'Upload PDF', maxFileSize: 5 }) }
};

export const ImageUpload: Story = {
  args: { field: createField('image', 'Vehicle Photo', { buttonLabel: 'Upload Photo', maxFileSize: 2, expanded: true }) }
};

export const DatePicker: Story = {
  args: { field: createField('date', 'Birth Date') }
};

export const Toggle: Story = {
  args: { field: createField('toggle', 'Notifications', { helpText: 'Enable email alerts' }) }
};

export const URL: Story = {
  args: { field: createField('url', 'Portfolio URL', { placeholder: 'https://' }) }
};

// ━━━━━━ CANVAS OVERVIEW ━━━━━━

export const CanvasOverview: Story = {
  name: 'Canvas / Overview',
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
  render: function Render() {
    const [fields, setFields] = React.useState<FieldItemData[]>([
      createField('text', 'VIN Number', { placeholder: 'Enter VIN', required: true }),
      createField('image', 'Vehicle Exterior', { expanded: true }),
      createField('dropdown', 'Roadworthiness', { options: ['Roadworthy', 'Needs Repairs'], expanded: false }),
    ]);
    const [draggedId, setDraggedId] = React.useState<string | null>(null);

    const handleUpdate = (id: string, updates: Partial<FieldItemData>) => {
      setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const handleDragStart = (id: string) => {
      setDraggedId(id);
    };

    const handleDragOver = (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      if (!draggedId || draggedId === targetId) return;

      const draggedIndex = fields.findIndex(f => f.id === draggedId);
      const targetIndex = fields.findIndex(f => f.id === targetId);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newFields = [...fields];
        const [removed] = newFields.splice(draggedIndex, 1);
        newFields.splice(targetIndex, 0, removed);
        setFields(newFields);
      }
    };

    const handleDragEnd = () => {
      setDraggedId(null);
    };

    return (
      <div className="fi-dual-view">
        <div className="fi-preview-section">
          <div className="fi-section-header">
            <span className="fi-section-badge fi-section-badge--builder">🏗 Wizard Builder Canvas</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {fields.map(f => (
              <FieldItem 
                key={f.id} 
                field={f} 
                isSelected={f.expanded}
                onUpdate={handleUpdate}
                onRemove={(id) => setFields(prev => prev.filter(item => item.id !== id))}
                draggable
                isDragging={draggedId === f.id}
                onDragStart={() => handleDragStart(f.id)}
                onDragOver={(e) => handleDragOver(e, f.id)}
                onDragEnd={handleDragEnd}
              />
            ))}
          </div>
        </div>

        <div className="fi-divider">
          <div className="fi-divider__line" />
          <span className="fi-divider__text">Deal Wizard Canvas</span>
          <div className="fi-divider__line" />
        </div>

        <div className="fi-preview-section">
          <div className="fi-section-header">
            <span className="fi-section-badge fi-section-badge--preview">✨ Deal Wizard (Front-End)</span>
          </div>
          <div style={{ 
            padding: '40px', 
            background: 'var(--background-primary)', 
            border: '1px solid var(--border-subtle)', 
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px'
          }}>
            <div style={{ marginBottom: '16px' }}>
              <h2 className="title-page-size-small" style={{ margin: 0, fontWeight: 700 }}>Vehicle Inspection Form</h2>
              <p className="fi-info__subtitle">Please complete the following details</p>
            </div>
            {fields.map(f => <DealWizardField key={f.id} field={f} />)}
            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-subtlest)' }}>
              <Button size="large" style={{ width: '100%' }}>Submit details</Button>
            </div>
          </div>
        </div>
      </div>
    );
  },
};
