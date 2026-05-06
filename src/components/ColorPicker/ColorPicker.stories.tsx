import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { useState } from 'react';
import { ColorPicker } from './ColorPicker';
import type { ColorPickerProps } from './ColorPicker';

const meta: Meta<typeof ColorPicker> = {
    title: 'Components/ColorPicker',
    component: ColorPicker,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/design/SgNdO2YmHiOGzsGwy1ZHWN/CASHY-Design-System-Kit?node-id=49057-45326',
        },
    },
    tags: ['autodocs'],
    argTypes: {
        value: {
            control: 'color',
            description: 'Currently selected colour (hex, e.g. "#EF4544"). Drives the selected swatch state and the hex-mode preview.',
        },
        label: {
            control: 'text',
            description: 'Label displayed above the picker row.',
        },
        onChange: { action: 'colour changed' },
    },
};

export default meta;
type Story = StoryObj<typeof ColorPicker>;

/* ─── Helper: controlled wrapper so interactions work inside stories ─── */
const InteractiveColorPicker = (args: ColorPickerProps) => {
    const [color, setColor] = useState(args.value);

    const handleChange = (newColor: string) => {
        setColor(newColor);
        args.onChange?.(newColor);
    };

    return <ColorPicker {...args} value={color} onChange={handleChange} />;
};

/* ─────────────────────────────────────────────────────────────────────── */

/**
 * **Default** — no preset colour selected. The user can click a swatch
 * to pick one, or click the `#` button to enter a custom hex code.
 */
export const Default: Story = {
    args: {
        label: 'Column Colour',
        onChange: fn(),
    },
    render: (args) => <InteractiveColorPicker {...args} />,
};

/**
 * **With Preset Selected** — one of the 6 preset swatches is active,
 * shown with a dark brand-coloured border ring.
 */
export const WithPresetSelected: Story = {
    args: {
        label: 'Column Colour',
        value: '#EF4544',
        onChange: fn(),
    },
    render: (args) => <InteractiveColorPicker {...args} />,
};

/**
 * **Hex Mode** — the `#` button on the swatch row switches the picker into
 * custom hex-entry mode. Type a 6-digit hex code, then confirm (✓) or
 * cancel (✕). This story starts with a preset colour already set so the
 * hex preview swatch renders immediately when you open the mode.
 */
export const HexMode: Story = {
    args: {
        label: 'Column Colour',
        value: '#EF4544',
        defaultHexMode: true,
        onChange: fn(),
    },
    render: (args) => <InteractiveColorPicker {...args} />,
    parameters: {
        docs: {
            description: {
                story:
                    'Click the **#** button to switch to hex-entry mode. Type any 6-digit hex code — the preview swatch updates live. Press ✓ to confirm or ✕ to cancel.',
            },
        },
    },
};
