import React, { useState, useRef, useEffect } from 'react';
import './ColorPicker.css';

import { COLOR_PICKER_PRESETS } from './colorPickerPresets';
import type { PresetColorId } from './colorPickerPresets';

export { COLOR_PICKER_PRESETS };
export type { PresetColorId };

export interface ColorPickerProps {
    /**
     * Currently selected colour value (hex string, e.g. "#EF4544").
     * When undefined, no swatch is in the selected state.
     */
    value?: string;
    /**
     * Label displayed above the picker row.
     * @default 'Column Colour'
     */
    label?: string;
    /**
     * Callback fired when a preset swatch is clicked or a hex value is confirmed.
     */
    onChange?: (color: string) => void;
    /** Additional class names for the root element */
    className?: string;
    /** If true, the picker opens in Hex mode instead of Swatch mode */
    defaultHexMode?: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Strip leading `#` and normalise to uppercase. */
const stripAndNormalise = (hex: string): string =>
    hex.replace(/[^0-9a-fA-F]/g, '').toUpperCase();

/**
 * Expand a 3-digit shorthand hex to 6 digits.
 * `"F0A"` → `"FF00AA"` — each nibble is doubled, the standard CSS algorithm.
 * 6-digit strings pass through unchanged. Other lengths return an empty string.
 */
const expandHex = (s: string): string => {
    const clean = stripAndNormalise(s);
    if (clean.length === 6) return clean;
    if (clean.length === 3) {
        return clean
            .split('')
            .map((c) => c + c)
            .join('');
    }
    return '';
};

/** Returns true when `s` is a valid 3- or 6-digit hex string (no `#`). */
const isValidHex = (s: string): boolean =>
    /^[0-9A-F]{3}$/.test(s) || /^[0-9A-F]{6}$/.test(s);

// ────────────────────────────────────────────────────────────────────────────

/**
 * Column colour picker for the KanBan board column configuration sidebar.
 *
 * Supports two interaction modes:
 * - **Swatch mode** – choose from 6 colour swatches; clicking the `#` button
 *   switches to hex-entry mode. The 6th slot is reserved for the most recent
 *   custom colour (falls back to fuchsia until one is set).
 * - **Hex mode** – a colour preview swatch + text input for an arbitrary hex
 *   code (supports 3- and 6-digit formats, with or without `#`), with confirm
 *   (✓) and cancel (✕) actions.
 */
export const ColorPicker = React.forwardRef<HTMLDivElement, ColorPickerProps>(({
    value,
    label = 'Column Colour',
    onChange,
    className = '',
    defaultHexMode = false,
}, ref) => {
    const [isHexMode, setIsHexMode] = useState(defaultHexMode);
    const [hexInput, setHexInput] = useState('');

    /**
     * The most recent user-defined custom colour (6-digit, no `#`).
     * Replaces the 6th swatch slot when set.
     */
    const [customColor, setCustomColor] = useState<string | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);

    // Build the visible swatch list: first 5 presets + custom slot
    const swatches = [
        ...COLOR_PICKER_PRESETS.slice(0, 5),
        customColor
            ? { id: 'custom' as const, value: `#${customColor}`, token: `#${customColor}` }
            : COLOR_PICKER_PRESETS[5],
    ];

    /** Normalise a hex value for comparison (strip `#`, uppercase). */
    const normaliseForCompare = (hex: string) => hex.replace('#', '').toUpperCase();

    /**
     * Derive the live preview colour shown next to the input in hex mode.
     * Supports both 3- and 6-digit inputs.
     */
    const previewColor: string = (() => {
        const expanded = expandHex(hexInput);
        if (expanded) return `#${expanded}`;
        return value ?? '#CCCCCC';
    })();

    // Focus the input and pre-fill with the current value when entering hex mode
    useEffect(() => {
        if (isHexMode) {
            setHexInput(value ? normaliseForCompare(value) : '');
            // Slight defer so the input mounts before focus
            requestAnimationFrame(() => inputRef.current?.focus());
        }
    }, [isHexMode, value]);

    // ── Handlers ────────────────────────────────────────────────────────────

    const handleSwatchClick = (color: string) => {
        onChange?.(color);
    };

    const handleHexButtonClick = () => {
        setIsHexMode(true);
    };

    const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Whitelist hex chars only (strips `#`, spaces, letters, etc.)
        const clean = stripAndNormalise(e.target.value).slice(0, 6);
        setHexInput(clean);
    };

    /**
     * Handle paste separately so that `#RRGGBB` (with hash) is cleaned
     * before the value reaches state — the change event might fire with
     * the raw pasted string depending on browser.
     */
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text');
        const clean = stripAndNormalise(pasted).slice(0, 6);
        setHexInput(clean);
    };

    const handleConfirm = () => {
        const expanded = expandHex(hexInput);
        if (expanded) {
            const fullHex = `#${expanded}`;
            setCustomColor(expanded);   // persist in 6th swatch slot
            onChange?.(fullHex);
        }
        setIsHexMode(false);
    };

    const handleCancel = () => {
        setIsHexMode(false);
        setHexInput('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleConfirm();
        if (e.key === 'Escape') handleCancel();
    };

    const canConfirm = isValidHex(hexInput);

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <div
            ref={ref}
            className={['color-picker', className].filter(Boolean).join(' ')}
        >
            {/* Label */}
            <span className="color-picker__label">{label}</span>

            {/* Input row */}
            <div className="color-picker__row">
                {isHexMode ? (
                    /* ── HEX mode ── */
                    <>
                        <div className="color-picker__hex-section">
                            {/* Live colour preview */}
                            <div
                                className="color-picker__hex-preview"
                                style={{ backgroundColor: previewColor }}
                                aria-hidden="true"
                            />

                            {/* Hex text input */}
                            <div className="color-picker__hex-input-wrapper">
                                <input
                                    ref={inputRef}
                                    className="color-picker__hex-input"
                                    type="text"
                                    value={hexInput}
                                    onChange={handleHexInputChange}
                                    onPaste={handlePaste}
                                    onKeyDown={handleKeyDown}
                                    placeholder="RRGGBB"
                                    maxLength={6}
                                    aria-label="Enter hex colour code"
                                    spellCheck={false}
                                    autoComplete="off"
                                />
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="color-picker__hex-actions">
                            {/* Confirm (✓) */}
                            <button
                                type="button"
                                className="color-picker__icon-btn"
                                onClick={handleConfirm}
                                aria-label="Confirm colour"
                                disabled={!canConfirm}
                            >
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <path d="M11.667 3.5L5.25 9.917 2.333 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>

                            {/* Cancel (✕) — danger-subtle styling */}
                            <button
                                type="button"
                                className="color-picker__icon-btn color-picker__icon-btn--danger"
                                onClick={handleCancel}
                                aria-label="Cancel"
                            >
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <path d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                    </>
                ) : (
                    /* ── Swatch mode ── */
                    <>
                        {swatches.map((swatch) => {
                            const isSelected = value
                                ? normaliseForCompare(value) === normaliseForCompare(swatch.value)
                                : false;
                            const isCustomSlot = swatch.id === 'custom';

                            return (
                                <button
                                    key={swatch.id}
                                    type="button"
                                    className={[
                                        'color-picker__swatch',
                                        isSelected ? 'color-picker__swatch--selected' : '',
                                        isCustomSlot ? 'color-picker__swatch--custom' : '',
                                    ].filter(Boolean).join(' ')}
                                    style={{ backgroundColor: swatch.token }}
                                    onClick={() => handleSwatchClick(swatch.value)}
                                    aria-label={
                                        isCustomSlot
                                            ? `Select custom colour ${swatch.value}`
                                            : `Select colour ${swatch.id}`
                                    }
                                    aria-pressed={isSelected}
                                    title={swatch.value}
                                />
                            );
                        })}

                        {/* Clear / No Color button */}
                        <button
                            type="button"
                            className="color-picker__hex-btn"
                            onClick={() => handleSwatchClick('')}
                            aria-label="Clear colour"
                        >
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ color: 'var(--text-error)' }}>
                                <path d="M8.5 1.5L1.5 8.5M1.5 1.5l7 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>

                        {/* Hex entry trigger button */}
                        <button
                            type="button"
                            className="color-picker__hex-btn"
                            onClick={handleHexButtonClick}
                            aria-label="Enter custom hex colour"
                        >
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path d="M1.25 3.75h7.5M1.25 6.25h7.5M3.75 1.25l-.833 7.5M7.083 1.25l-.833 7.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
});

ColorPicker.displayName = 'ColorPicker';
