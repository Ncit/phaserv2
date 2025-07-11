# Poker Game Style Guide

## Color Palette

### Primary Colors
- **Orange Accent**: `#FF4B00` - Hand rank text, player names
- **Progress Bar**: `#fb733a` - Active progress fill
- **Player Orange**: `#FF6A13` - Player name highlights

### Interactive States
- **Hover Tint**: `0xdddddd` - Light hover state for buttons
- **Click Tint**: `0x888888` - Active click state for buttons
- **Red Tint**: `0xff0000` - Error/negative states (dim overlay)
- **Muted Blue**: `0x9fa6b3` - Secondary text (player counts)

### Text Colors
- **Primary Text**: `#ffffff` - Main UI text (white)
- **Secondary Text**: `#ffffff` with 22% alpha - Subtle labels
- **Background Colors**: `0x333333`, `0x111111` - Progress bar backgrounds

## Typography

### Primary Font
- **Family**: `Arial` - Game UI elements, buttons, values
- **Sizes**: 
  - Small: `12px` - Button labels
  - Medium: `14px` - Action button text  
  - Large: `18px` - Bank/chip text
  - XLarge: `20px` - Button values
  - Display: `22px` - Hand rank display
  - Title: `24px` - User names
  - Header: `26px` - Chip counts

### Secondary Font
- **Family**: `Georgia, "Goudy Bookletter 1911", Times, serif` - Lobby UI, user interface
- **Usage**: Start scene, lobby elements, player statistics

### Text Styling
- **Stroke**: `#000000` with `strokeThickness: 1` - Text outlines for readability
- **Origin**: `0.5` - Centered text alignment standard

## Spacing & Scaling

### Standard Scales
- **UI Elements**: `0.3` - Standard button scale
- **Large Buttons**: `0.4` - Bonus button, prominent actions
- **Card Scale**: `0.13` - Community cards
- **Player Cards**: `0.36` - Individual player cards
- **User Avatar**: `0.3` - Profile avatars
- **Profile Elements**: `0.34-0.36` - Crown, progress, star icons

### Layout Constants
- **Button Spacing**: `240px` - Game mode button spacing
- **Card Spacing**: `88px` - Community card spacing
- **Standard Padding**: Based on 0.5 origin centering

## Interaction Patterns

### Button States
1. **Default**: Original scale and color
2. **Hover**: 
   - Tint: `0xdddddd`
   - Scale: `1.1x` (for some buttons)
   - Cursor: Hand cursor (`useHandCursor: true`)
3. **Active/Click**:
   - Tint: `0x888888`
   - Duration: `150ms` delay before reset
4. **Reset**: Return to default state

### Standard Button Setup
```javascript
button.setInteractive({ useHandCursor: true });
button.on('pointerover', () => button.setTint(0xdddddd));
button.on('pointerout', () => button.clearTint());
button.on('pointerdown', () => button.setTint(0x888888));
// 150ms delay for reset
```

## Component Standards

### Progress Bar
- **Background**: `0x333333` with `0xffffff` stroke
- **Inner**: `0x111111` background  
- **Fill**: `#fb733a` active color
- **Dimensions**: 260px width, 10px height

### Text Labels
- **Standard Format**: White text with black stroke
- **Positioning**: Centered with `setOrigin(0.5)`
- **Hierarchy**: Size-based importance (12px → 26px)

### Cards
- **Community**: `0.13` scale, `88px` spacing, centered container
- **Player**: `0.36` scale, slight rotation (-0.24/+0.24 radians)
- **Container**: Centered positioning with mathematical layout

## Visual Hierarchy

1. **Primary Actions**: Largest scale (0.4), prominent positioning
2. **Secondary Actions**: Standard scale (0.3), grouped logically  
3. **Information Display**: Varied text sizes, strategic color use
4. **Background Elements**: Scaled appropriately (0.5 for overlays)

## Accessibility Considerations

- **Contrast**: White text on dark backgrounds
- **Text Outlines**: Black strokes for readability over images
- **Hand Cursors**: Clear interactive affordances
- **Visual Feedback**: Immediate tint changes on interaction
