import React, { useState, useRef, useEffect } from 'react';

interface InlineEditProps {
  value: string;
  onSave: (value: string) => void;
  textClassName?: string;
  containerClassName?: string;
  iconNode: React.ReactNode;
}

export function InlineEdit({ 
  value, 
  onSave, 
  textClassName = "",
  containerClassName = "",
  iconNode
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    } else {
      setTempValue(value);
    }
  }, [isEditing, value]);

  const handleSave = () => {
    if (tempValue.trim() !== '' && tempValue !== value) {
      onSave(tempValue.trim());
    } else {
      setTempValue(value);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setTempValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className={`flex items-center ${containerClassName}`}>
        <div className={`relative flex flex-col justify-end leading-[0] shrink-0 whitespace-nowrap ${textClassName}`}>
          <p className="leading-[1.2] px-1 opacity-0 pointer-events-none">{tempValue || ' '}</p>
          <input
            ref={inputRef}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-full bg-transparent outline-none border-b-2 border-[#1B1D20] px-1 py-0 m-0 ${textClassName}`}
          />
        </div>
        <div className="invisible opacity-0 size-[20px] shrink-0" />
      </div>
    );
  }

  return (
    <div 
      className={`cursor-pointer group flex items-center transition-all ${containerClassName}`} 
      onClick={() => setIsEditing(true)}
      title="Click to edit"
    >
      <div className={`flex flex-col justify-end leading-[0] relative shrink-0 whitespace-nowrap ${textClassName}`}>
        <p className="leading-[1.2] px-1">{value}</p>
      </div>
      <div className="overflow-clip relative shrink-0 size-[20px]">
        {iconNode}
      </div>
    </div>
  );
}
