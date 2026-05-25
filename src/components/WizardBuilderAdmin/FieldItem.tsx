import React, { useState } from 'react';
import './FieldItem.css';
import type { Field } from './DealWizardBuilder';
import { Tooltip } from '../Tooltip/Tooltip';

interface FieldItemProps {
  field: Field;
  onRemove: (fieldId: string) => void;
  onUpdate: (fieldId: string, updates: Partial<Field>) => void;
  isSelected?: boolean;
  onSelect?: () => void;
  dragHandleRef?: (node: HTMLElement | null) => void;
}

// ─── SVG Icons ───────────────────────────────────────────────────────────────

const DragHandleIcon = () => (
  <svg width="10" height="14" viewBox="0 0 10 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="2.5" cy="3" r="1" fill="#6C798B" />
    <circle cx="7.5" cy="3" r="1" fill="#6C798B" />
    <circle cx="2.5" cy="7" r="1" fill="#6C798B" />
    <circle cx="7.5" cy="7" r="1" fill="#6C798B" />
    <circle cx="2.5" cy="11" r="1" fill="#6C798B" />
    <circle cx="7.5" cy="11" r="1" fill="#6C798B" />
  </svg>
);

const TrashIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M10 10C10.5523 10 11 10.4477 11 11V17C11 17.5523 10.5523 18 10 18C9.44772 18 9 17.5523 9 17V11C9 10.4477 9.44772 10 10 10Z" fill="currentColor"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M14 10C14.5523 10 15 10.4477 15 11V17C15 17.5523 14.5523 18 14 18C13.4477 18 13 17.5523 13 17V11C13 10.4477 13.4477 10 14 10Z" fill="currentColor"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M9.29289 3.29289C9.48043 3.10536 9.73478 3 10 3H14C14.2652 3 14.5196 3.10536 14.7071 3.29289C14.8946 3.48043 15 3.73478 15 4V5H17V4C17 3.20435 16.6839 2.44129 16.1213 1.87868C15.5587 1.31607 14.7956 1 14 1H10C9.20435 1 8.44129 1.31607 7.87868 1.87868C7.31607 2.44129 7 3.20435 7 4V5H9V4C9 3.73478 9.10536 3.48043 9.29289 3.29289ZM5 5H3C2.44772 5 2 5.44772 2 6C2 6.55228 2.44772 7 3 7H4V20C4 20.7957 4.31607 21.5587 4.87868 22.1213C5.44129 22.6839 6.20435 23 7 23H17C17.7957 23 18.5587 22.6839 19.1213 22.1213C19.6839 21.5587 20 20.7957 20 20V7H21C21.5523 7 22 6.55228 22 6C22 5.44772 21.5523 5 21 5H19C19.5523 5 20 5.44772 20 6V7H18V20C18 20.2652 17.8946 20.5196 17.7071 20.7071C17.5196 20.8946 17.2652 21 17 21H7C6.73478 21 6.48043 20.8946 6.29289 20.7071C6.10536 20.5196 6 20.2652 6 20V7H4V6C4 5.44772 4.44772 5 5 5Z" fill="currentColor"/>
  </svg>
);

const CheckboxIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M22.7071 3.29289C23.0976 3.68342 23.0976 4.31658 22.7071 4.70711L12.7071 14.7071C12.3166 15.0976 11.6834 15.0976 11.2929 14.7071L8.29289 11.7071C7.90237 11.3166 7.90237 10.6834 8.29289 10.2929C8.68342 9.90237 9.31658 9.90237 9.70711 10.2929L12 12.5858L21.2929 3.29289C21.6834 2.90237 22.3166 2.90237 22.7071 3.29289Z" fill="currentColor"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M5 4C4.73478 4 4.48043 4.10536 4.29289 4.29289C4.10536 4.48043 4 4.73478 4 5V19C4 19.2652 4.10536 19.5196 4.29289 19.7071C4.48043 19.8946 4.73478 20 5 20H19C19.2652 20 19.5196 19.8946 19.7071 19.7071C19.8946 19.5196 20 19.2652 20 19V12C20 11.4477 20.4477 11 21 11C21.5523 11 22 11.4477 22 12V19C22 19.7957 21.6839 20.5587 21.1213 21.1213C20.5587 21.6839 19.7957 22 19 22H5C4.20435 22 3.44129 21.6839 2.87868 21.1213C2.31607 20.5587 2 19.7957 2 19V5C2 4.20435 2.31607 3.44129 2.87868 2.87868C3.44129 2.31607 4.20435 2 5 2H16C16.5523 2 17 2.44772 17 3C17 3.55228 16.5523 4 16 4H5Z" fill="currentColor"/>
  </svg>
);

const DropdownIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3ZM1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12Z" fill="currentColor"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M7.29289 11.2929C7.68342 10.9024 8.31658 10.9024 8.70711 11.2929L12 14.5858L15.2929 11.2929C15.6834 10.9024 16.3166 10.9024 16.7071 11.2929C17.0976 11.6834 17.0976 12.3166 16.7071 12.7071L12.7071 16.7071C12.3166 17.0976 11.6834 17.0976 11.2929 16.7071L7.29289 12.7071C6.90237 12.3166 6.90237 11.6834 7.29289 11.2929Z" fill="currentColor"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M12 7C12.5523 7 13 7.44772 13 8V16C13 16.5523 12.5523 17 12 17C11.4477 17 11 16.5523 11 16V8C11 7.44772 11.4477 7 12 7Z" fill="currentColor"/>
  </svg>
);

const FileUploadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M8.66326 2.00856C10.0227 1.95847 11.3759 2.21723 12.621 2.76538C13.8661 3.31352 14.9707 4.1368 15.8518 5.17331C16.5633 6.01023 17.1141 6.9686 17.479 8H18C19.333 8.00088 20.6284 8.44566 21.6806 9.26414C22.7328 10.0826 23.4825 11.2282 23.8113 12.52C24.1401 13.8119 24.0293 15.1764 23.4965 16.3983C22.9636 17.6203 22.039 18.6299 20.8686 19.268C20.3837 19.5324 19.7763 19.3536 19.512 18.8687C19.2476 18.3838 19.4264 17.7764 19.9113 17.512C20.6916 17.0866 21.308 16.4135 21.6632 15.5989C22.0184 14.7843 22.0923 13.8746 21.8731 13.0134C21.6539 12.1521 21.1541 11.3884 20.4526 10.8428C19.7512 10.2971 18.888 10.0006 17.9993 10H16.74C16.2841 10 15.8859 9.69167 15.7718 9.25031C15.5069 8.22589 15.0133 7.27485 14.328 6.46868C13.6427 5.6625 12.7835 5.02218 11.8151 4.59584C10.8467 4.1695 9.79428 3.96825 8.7369 4.0072C7.67952 4.04616 6.64473 4.32432 5.71032 4.82076C4.77592 5.31721 3.96622 6.01902 3.34209 6.87344C2.71796 7.72786 2.29565 8.71265 2.1069 9.75378C1.91815 10.7949 1.96789 11.8653 2.25236 12.8844C2.53683 13.9035 3.04863 14.8449 3.74929 15.6378C4.11501 16.0517 4.076 16.6836 3.66215 17.0493C3.24831 17.4151 2.61635 17.376 2.25063 16.9622C1.34977 15.9428 0.691738 14.7324 0.325992 13.4221C-0.039755 12.1118 -0.103695 10.7356 0.138979 9.39701C0.381653 8.05842 0.924626 6.79226 1.72708 5.69372C2.52953 4.59518 3.57057 3.69285 4.77195 3.05457C5.97333 2.41628 7.30377 2.05865 8.66326 2.00856Z" fill="currentColor"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M11.9674 11.0005C11.8428 11.0045 11.7239 11.0313 11.6148 11.0769C11.4963 11.1264 11.3893 11.1981 11.2991 11.2867L11.2929 11.2929L11.2921 11.2936C11.1116 11.4745 11 11.7242 11 12V14.4142V21C11 21.5523 11.4477 22 12 22C12.5522 22 13 21.5523 13 21V14.4142L15.2929 16.7071C15.6834 17.0976 16.3165 17.0976 16.7071 16.7071C17.0976 16.3166 17.0976 15.6834 16.7071 15.2929L12.7078 11.2936L12.7071 11.2929L12.7005 11.2864C12.6062 11.1937 12.498 11.1236 12.3827 11.0759C12.2722 11.03 12.1517 11.0035 12.0253 11.0003" fill="currentColor"/>
    <path d="M7.29285 16.7071C7.68338 17.0976 8.31654 17.0976 8.70707 16.7071L11 14.4142V12C11 11.7242 11.1116 11.4745 11.2921 11.2936L7.29285 15.2929C6.90233 15.6834 6.90233 16.3166 7.29285 16.7071Z" fill="currentColor"/>
  </svg>
);

const ImageUploadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V12.5858L21.7071 14.2929C21.9021 14.4879 21.9998 14.7434 22 14.999V5C22 3.34315 20.6569 2 19 2H5C3.34315 2 2 3.34315 2 5V19C2 20.6562 3.34205 21.9989 4.99797 22C4.74273 21.9995 4.48764 21.9019 4.29289 21.7071C3.90237 21.3166 3.90237 20.6834 4.29289 20.2929L4.64909 19.9367C4.2699 19.7946 4 19.4288 4 19V5Z" fill="currentColor"/>
    <path d="M4.29289 20.2929C3.90237 20.6834 3.90237 21.3166 4.29289 21.7071C4.48764 21.9019 4.74273 21.9995 4.99797 22H5H5.00196L5.70288 21.7113L5.70711 21.7071L7.41421 20H5C4.87652 20 4.75828 19.9776 4.64909 19.9367L4.29289 20.2929Z" fill="currentColor"/>
    <path d="M16.7071 9.29289C16.3166 8.90237 15.6834 8.90237 15.2929 9.29289L4.64909 19.9367C4.75828 19.9776 4.87652 20 5 20H7.41421L16 11.4142L20 15.4142V12.5858L16.7071 9.29289Z" fill="currentColor"/>
    <path d="M20.2929 15.7071C20.6834 16.0976 21.3166 16.0976 21.7071 15.7071C21.9021 15.5121 21.9998 15.2566 22 15.001V14.999C21.9998 14.7434 21.9021 14.4879 21.7071 14.2929L20 12.5858V15.4142L20.2894 15.7036L20.2929 15.7071Z" fill="currentColor"/>
    <path d="M9.85786 20H7.41421L5.70711 21.7071L5.70288 21.7113L9.85786 20Z" fill="currentColor"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M19 20H9.85786L5.70288 21.7113L5.00196 22H19C20.6569 22 22 20.6569 22 19V15.001C21.9998 15.2566 21.9021 15.5121 21.7071 15.7071C21.3166 16.0976 20.6834 16.0976 20.2929 15.7071L20.2894 15.7036L20 15.8228V19C20 19.5523 19.5523 20 19 20Z" fill="currentColor"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M6 8.5C6 7.11929 7.11929 6 8.5 6C9.88071 6 11 7.11929 11 8.5C11 9.88071 9.88071 11 8.5 11C7.11929 11 6 9.88071 6 8.5ZM8 8.5C8 8.22386 8.22386 8 8.5 8C8.77614 8 9 8.22386 9 8.5C9 8.77614 8.77614 9 8.5 9C8.22386 9 8 8.77614 8 8.5Z" fill="currentColor"/>
  </svg>
);

const UrlIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M6 8C4.93913 8 3.92172 8.42143 3.17157 9.17157C2.42143 9.92172 2 10.9391 2 12C2 13.0609 2.42143 14.0783 3.17157 14.8284C3.54301 15.1999 3.98396 15.4945 4.46927 15.6955C4.95457 15.8965 5.47471 16 6 16H9C9.55229 16 10 16.4477 10 17C10 17.5523 9.55229 18 9 18H6C5.21207 18 4.43185 17.8448 3.7039 17.5433C2.97595 17.2417 2.31451 16.7998 1.75736 16.2426C0.632141 15.1174 0 13.5913 0 12C0 10.4087 0.632141 8.88258 1.75736 7.75736C2.88258 6.63214 4.4087 6 6 6H9C9.55229 6 10 6.44772 10 7C10 7.55228 9.55229 8 9 8H6ZM14 7C14 6.44772 14.4477 6 15 6H18C18.7879 6 19.5681 6.15519 20.2961 6.45672C21.0241 6.75825 21.6855 7.20021 22.2426 7.75736C22.7998 8.31451 23.2417 8.97595 23.5433 9.7039C23.8448 10.4319 24 11.2121 24 12C24 12.7879 23.8448 13.5681 23.5433 14.2961C23.2417 15.0241 22.7998 15.6855 22.2426 16.2426C21.6855 16.7998 21.0241 17.2417 20.2961 17.5433C19.5681 17.8448 18.7879 18 18 18H15C14.4477 18 14 17.5523 14 17C14 16.4477 14.4477 16 15 16H18C18.5253 16 19.0454 15.8965 19.5307 15.6955C20.016 15.4945 20.457 15.1999 20.8284 14.8284C21.1999 14.457 21.4945 14.016 21.6955 13.5307C21.8965 13.0454 22 12.5253 22 12C22 11.4747 21.8965 10.9546 21.6955 10.4693C21.4945 9.98396 21.1999 9.54301 20.8284 9.17157C20.457 8.80014 20.016 8.5055 19.5307 8.30448C19.0454 8.10346 18.5253 8 18 8H15C14.4477 8 14 7.55228 14 7Z" fill="currentColor"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M7 12C7 11.4477 7.44772 11 8 11H16C16.5523 11 17 11.4477 17 12C17 12.5523 16.5523 13 16 13H8C7.44772 13 7 12.5523 7 12Z" fill="currentColor"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M5 5C4.44772 5 4 5.44772 4 6V20C4 20.5523 4.44772 21 5 21H19C19.5523 21 20 20.5523 20 20V6C20 5.44772 19.5523 5 19 5H5ZM2 6C2 4.34315 3.34315 3 5 3H19C20.6569 3 22 4.34315 22 6V20C22 21.6569 20.6569 23 19 23H5C3.34315 23 2 21.6569 2 20V6Z" fill="currentColor"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M16 1C16.5523 1 17 1.44772 17 2V6C17 6.55228 16.5523 7 16 7C15.4477 7 15 6.55228 15 6V2C15 1.44772 15.4477 1 16 1Z" fill="currentColor"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M8 1C8.55228 1 9 1.44772 9 2V6C9 6.55228 8.55228 7 8 7C7.44772 7 7 6.55228 7 6V2C7 1.44772 7.44772 1 8 1Z" fill="currentColor"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M2 10C2 9.44771 2.44772 9 3 9H21C21.5523 9 22 9.44771 22 10C22 10.5523 21.5523 11 21 11H3C2.44772 11 2 10.5523 2 10Z" fill="currentColor"/>
  </svg>
);

const ToggleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M8 6C4.68629 6 2 8.68629 2 12C2 15.3137 4.68629 18 8 18H16C19.3137 18 22 15.3137 22 12C22 8.68629 19.3137 6 16 6H8ZM0 12C0 7.58172 3.58172 4 8 4H16C20.4183 4 24 7.58172 24 12C24 16.4183 20.4183 20 16 20H8C3.58172 20 0 16.4183 0 12Z" fill="currentColor"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M16 10C14.8954 10 14 10.8954 14 12C14 13.1046 14.8954 14 16 14C17.1046 14 18 13.1046 18 12C18 10.8954 17.1046 10 16 10ZM12 12C12 9.79086 13.7909 8 16 8C18.2091 8 20 9.79086 20 12C20 14.2091 18.2091 16 16 16C13.7909 16 12 14.2091 12 12Z" fill="currentColor"/>
  </svg>
);

// ─── Sub-Components ──────────────────────────────────────────────────────────

const TextExpandedBody = ({ field, onUpdate }: { field: Field; onUpdate: (id: string, updates: Partial<Field>) => void }) => (
  <div className="fi-body-content">
    <div className="fi-section">
      <div className="fi-section__title">General</div>
      <div className="fi-section__fields">
        <div className="fi-field-group">
          <label className="fi-label">Field Label</label>
          <input className="fi-input" value={field.label} onChange={e => onUpdate(field.id, { label: e.target.value })} />
        </div>
        <div className="fi-field-group">
          <label className="fi-label">Help Text / Description</label>
          <input className="fi-input" value={field.helpText ?? ''} onChange={e => onUpdate(field.id, { helpText: e.target.value })} />
        </div>
      </div>
    </div>
    {field.fieldType.type !== 'toggle' && field.fieldType.type !== 'url' && field.fieldType.type !== 'date' && (
      <div className="fi-section">
        <div className="fi-section__title">Constraints</div>
        <div className="fi-section__fields fi-section__fields--cols2">
          <div className="fi-field-group">
            <label className="fi-label">Placeholder</label>
            <input className="fi-input" value={field.placeholder ?? ''} onChange={e => onUpdate(field.id, { placeholder: e.target.value })} />
          </div>
          <div className="fi-field-group">
            <label className="fi-label">Default Value</label>
            <input className="fi-input" value={field.defaultValue ?? ''} onChange={e => onUpdate(field.id, { defaultValue: e.target.value })} />
          </div>
        </div>
      </div>
    )}
  </div>
);

const FileExpandedBody = ({ field, onUpdate }: { field: Field; onUpdate: (id: string, updates: Partial<Field>) => void }) => (
  <div className="fi-body-content">
    <div className="fi-section">
      <div className="fi-section__title">General</div>
      <div className="fi-section__fields">
        <div className="fi-field-group">
          <label className="fi-label">Field Label</label>
          <input className="fi-input" value={field.label} onChange={e => onUpdate(field.id, { label: e.target.value })} />
        </div>
        <div className="fi-field-group">
          <label className="fi-label">Upload Button Label</label>
          <input className="fi-input" value={field.buttonLabel ?? 'Upload file'} onChange={e => onUpdate(field.id, { buttonLabel: e.target.value })} />
        </div>
      </div>
    </div>
    <div className="fi-section">
      <div className="fi-section__title">Limits & Formats</div>
      <div className="fi-section__fields fi-section__fields--cols2">
        <div className="fi-field-group">
          <label className="fi-label">Max File Size (MB)</label>
          <input className="fi-input" type="number" value={field.maxFileSize ?? ''} onChange={e => onUpdate(field.id, { maxFileSize: parseInt(e.target.value) || 10 })} />
        </div>
        <div className="fi-field-group">
          <label className="fi-label">Allowed Formats</label>
          <input className="fi-input" value={field.allowedFormats ?? ''} onChange={e => onUpdate(field.id, { allowedFormats: e.target.value })} placeholder=".pdf, .png" />
        </div>
      </div>
    </div>
  </div>
);

const DropdownExpandedBody = ({ field, onUpdate }: { field: Field; onUpdate: (id: string, updates: Partial<Field>) => void }) => {
  const [newOption, setNewOption] = useState('');
  const options = field.options ?? [];

  return (
    <div className="fi-body-content">
      <div className="fi-section">
        <div className="fi-section__title">General</div>
        <div className="fi-section__fields">
          <div className="fi-field-group">
            <label className="fi-label">Field Label</label>
            <input className="fi-input" value={field.label} onChange={e => onUpdate(field.id, { label: e.target.value })} />
          </div>
          <div className="fi-field-group">
            <label className="fi-label">Help Text / Description</label>
            <input className="fi-input" value={field.helpText ?? ''} onChange={e => onUpdate(field.id, { helpText: e.target.value })} />
          </div>
        </div>
      </div>
      <div className="fi-section">
        <div className="fi-section__title">Options</div>
        <div className="fi-section__fields">
          <div className="fi-options-stack">
            {options.map((opt, idx) => (
              <div key={idx} className="fi-option-row">
                <input className="fi-input fi-input--small" value={opt} onChange={e => {
                  const n = [...options]; n[idx] = e.target.value; onUpdate(field.id, { options: n });
                }} />
                <button className="fi-option-row__remove" onClick={() => onUpdate(field.id, { options: options.filter((_, i) => i !== idx) })}><TrashIcon /></button>
              </div>
            ))}
          </div>
          <div className="fi-option-add">
            <input className="fi-input" value={newOption} onChange={e => setNewOption(e.target.value)} onKeyDown={e => e.key === 'Enter' && (onUpdate(field.id, { options: [...options, newOption] }), setNewOption(''))} placeholder="Add option…" />
            <button className="fi-btn-add-primary" onClick={() => { if(newOption.trim()) { onUpdate(field.id, { options: [...options, newOption.trim()] }); setNewOption(''); } }}>Add</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export function FieldItem({ field, onRemove, onUpdate, isSelected, onSelect, dragHandleRef }: FieldItemProps) {
  const toggleExpanded = (e: React.MouseEvent) => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('select') || target.closest('.fi-drag-handle')) return;
    onSelect?.();
    onUpdate?.(field.id, { expanded: !field.expanded });
  };

  const getSubtitle = () => {
    const type = field.fieldType.type;
    let info: string;
    switch (type) {
      case 'dropdown':
      case 'checkbox':
        info = `${field.options?.length || 0} options`;
        break;
      case 'fileUpload':
      case 'imageUpload':
        info = `${field.buttonLabel || 'Upload'} • ${field.maxFileSize || 10}MB`;
        break;
      default:
        info = field.placeholder || (field.required ? 'Required' : 'Optional');
    }
    return `${field.fieldType.label} • ${info}`;
  };

  const getTypeIcon = () => {
    switch (field.fieldType.type) {
      case 'dropdown': return <DropdownIcon />;
      case 'checkbox': return <CheckboxIcon />;
      case 'fileUpload': return <FileUploadIcon />;
      case 'imageUpload': return <ImageUploadIcon />;
      case 'url': return <UrlIcon />;
      case 'date': return <CalendarIcon />;
      case 'toggle': return <ToggleIcon />;
      default:
        return <div className="fi-type-badge__char">{field.fieldType.label[0]}</div>;
    }
  };

  const renderExpandedBody = () => {
    const type = field.fieldType.type;
    if (type === 'dropdown' || type === 'checkbox') {
      return <DropdownExpandedBody field={field} onUpdate={onUpdate} />;
    }
    if (type === 'fileUpload' || type === 'imageUpload') {
      return <FileExpandedBody field={field} onUpdate={onUpdate} />;
    }
    return <TextExpandedBody field={field} onUpdate={onUpdate} />;
  };

  return (
    <div className={`fi-card ${field.expanded ? 'fi-card--expanded' : 'fi-card--collapsed'} ${isSelected ? 'fi-card--selected' : ''}`}>
      <div className="fi-header" onClick={toggleExpanded}>
        <div className="fi-header__left">
          <div ref={dragHandleRef} className="fi-drag-handle"><DragHandleIcon /></div>
          <div className="fi-type-badge">{getTypeIcon()}</div>
          <div className="fi-info">
            <span className="fi-info__title">{field.label}</span>
            <span className="fi-info__subtitle">{getSubtitle()}</span>
          </div>
        </div>

        <div className="fi-header__actions">
          {!field.expanded && (
            <div className="fi-required-wrap">
              <span className="fi-required-text">Required</span>
              <button 
                className={`fi-pill-toggle ${field.required ? 'fi-pill-toggle--on' : ''}`} 
                onClick={(e) => { e.stopPropagation(); onUpdate(field.id, { required: !field.required }); }}
              >
                <div className="fi-pill-toggle__handle" />
              </button>
            </div>
          )}
          <Tooltip content="Delete field" side="top">
            <button className="fi-header-btn-icon" onClick={(e) => { e.stopPropagation(); onRemove(field.id); }}>
              <TrashIcon />
            </button>
          </Tooltip>
          {field.expanded && <button className="fi-collapse-text-btn" onClick={() => onUpdate(field.id, { expanded: false })}>Collapse</button>}
        </div>
      </div>

      {field.expanded && (
        <div className="fi-body">
          <div className="fi-body__inner">
            {renderExpandedBody()}
            <div className="fi-footer">
              <button className="fi-required-footer" onClick={() => onUpdate(field.id, { required: !field.required })}>
                <span className="fi-required-text">Required</span>
                <div className={`fi-pill-toggle ${field.required ? 'fi-pill-toggle--on' : ''}`}><div className="fi-pill-toggle__handle" /></div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
