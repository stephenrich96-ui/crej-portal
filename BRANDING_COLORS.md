# CREJ Branding Colors

## Current Color Scheme
The app uses CREJ branding colors defined in `tailwind.config.ts`. 

### Color Palette
- **Primary**: `#1e40af` (Deep blue) - Main brand color
- **Secondary**: `#0ea5e9` (Sky blue) - Accent color
- **Accent**: `#3b82f6` (Bright blue) - Interactive elements
- **Dark**: `#1e293b` (Dark slate) - Hover states, dark text
- **Light**: `#f8fafc` (Light gray) - Backgrounds, highlights

## To Update Colors from CREJLLC.net

1. Visit https://crejllc.net and inspect the website colors
2. Update the colors in `tailwind.config.ts` under the `crej` color object
3. Common places to find brand colors:
   - Header/navigation background
   - Primary buttons
   - Links
   - Logo colors
   - Footer colors

### Example Update
```typescript
crej: {
  primary: "#YOUR_PRIMARY_COLOR", // Replace with actual CREJ primary color
  secondary: "#YOUR_SECONDARY_COLOR",
  accent: "#YOUR_ACCENT_COLOR",
  dark: "#YOUR_DARK_COLOR",
  light: "#YOUR_LIGHT_COLOR",
}
```

## Usage in Components
Colors are used throughout the app via Tailwind classes:
- `text-crej-primary` - Primary text color
- `bg-crej-primary` - Primary background
- `border-crej-primary` - Primary borders
- `hover:text-crej-dark` - Hover states
- `bg-crej-light` - Light backgrounds
