import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Save, RefreshCw } from 'lucide-react';
import { useToast } from '../components/Toast/ToastContext';
import {
  getBusinessAreaMappings,
  saveBusinessAreaMappings,
  DEFAULT_BUSINESS_AREA_MAPPINGS
} from '../data/businessAreaMapping';

const BUSINESS_AREAS = ['Automotive', 'Electronics', 'Luxury', 'Mixed'];

export const BusinessAreasPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [mappings, setMappings] = useState<Record<string, string>>(() => getBusinessAreaMappings());

  const handleAreaChange = (category: string, newArea: string) => {
    setMappings(prev => ({
      ...prev,
      [category]: newArea
    }));
  };

  const handleSave = () => {
    saveBusinessAreaMappings(mappings);
    showToast('Business Area mappings saved successfully!', 'success');
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset mappings to defaults?')) {
      setMappings({ ...DEFAULT_BUSINESS_AREA_MAPPINGS });
      saveBusinessAreaMappings(DEFAULT_BUSINESS_AREA_MAPPINGS);
      showToast('Mappings reset to default settings.', 'info');
    }
  };

  // Capitalize path for display
  const formatCategoryName = (cat: string) => {
    return cat
      .split('.')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' > ');
  };

  return (
    <div className="bg-[var(--background-secondary)] min-h-full w-full overflow-y-auto font-['Inter',sans-serif] px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-[var(--background-primary)] border border-[var(--border-subtle)] hover:bg-[var(--background-secondary-hover)] rounded-xl transition-all cursor-pointer text-[var(--text-primary)]"
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">Business Areas Settings</h1>
              <p className="text-xs md:text-sm text-[var(--text-subtle)] mt-1">
                Configure which Business Area item categories are mapped to for deal pricing and logic.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-[var(--border-subtle)] bg-[var(--background-primary)] hover:bg-[var(--background-secondary-hover)] text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer text-[var(--text-subtle)]"
            >
              <RefreshCw size={14} />
              Reset Defaults
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#4649e5] hover:bg-[#3b3ec3] text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <Save size={14} />
              Save Mappings
            </button>
          </div>
        </div>

        {/* Mappings card */}
        <div className="bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--background-secondary)]">
            <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">Category Mappings</h2>
          </div>
          
          <div className="divide-y divide-[var(--border-subtle)]">
            {Object.keys(mappings).map(category => (
              <div 
                key={category} 
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--background-hover)] transition-colors"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-[var(--text-primary)]">
                    {formatCategoryName(category)}
                  </span>
                  <span className="text-xs text-[var(--text-subtlest)] font-mono">
                    {category}
                  </span>
                </div>
                
                <div className="w-full sm:w-60">
                  <select
                    value={mappings[category]}
                    onChange={(e) => handleAreaChange(category, e.target.value)}
                    className="w-full h-10 px-3 bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-brand)] focus:ring-2 focus:ring-[var(--border-brand)]/20 transition-all font-medium"
                    aria-label={`Select Business Area for ${category}`}
                  >
                    {BUSINESS_AREAS.map(area => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
