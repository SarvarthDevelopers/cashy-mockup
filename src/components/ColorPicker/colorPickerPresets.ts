/** Preset colour options shown in the first 5 swatch slots */
export const COLOR_PICKER_PRESETS = [
    { id: 'red',     value: '#EF4544', token: 'var(--red-500)'    },
    { id: 'yellow',  value: '#CA8B04', token: 'var(--yellow-600)' },
    { id: 'cyan',    value: '#15B8A7', token: 'var(--cyan-500)'   },
    { id: 'blue',    value: '#167BDA', token: 'var(--blue-500)'   },
    { id: 'lilac',   value: '#6366F1', token: 'var(--lilac-500)'  },
    { id: 'fuchsia', value: '#BC26D3', token: 'var(---fuchsia-600)'},
] as const;

export type PresetColorId = typeof COLOR_PICKER_PRESETS[number]['id'];
