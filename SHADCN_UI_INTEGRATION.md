# shadcn/ui Integration Guide

## Overview

This document describes the integration of **shadcn/ui** into the Limpopo Connect React + Vite + Supabase application.

## What is shadcn/ui?

shadcn/ui is a collection of re-usable components built using Radix UI and Tailwind CSS. Unlike traditional component libraries, shadcn/ui components are copied directly into your project, giving you full control over the code.

**Official Documentation**: https://ui.shadcn.com/

## Integration Details

### Installation Date
October 12, 2025

### Dependencies Added

```json
{
  "dependencies": {
    "@radix-ui/react-slot": "^1.1.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.4"
  },
  "devDependencies": {
    "@types/node": "^22.10.2",
    "tailwindcss-animate": "^1.0.7"
  }
}
```

### Configuration Files

#### 1. `components.json`
Main shadcn/ui configuration file:
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

#### 2. `src/lib/utils.ts`
Utility function for merging Tailwind classes:
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

#### 3. Updated `tsconfig.app.json`
Added path aliases for `@/` imports:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### 4. Updated `vite.config.ts`
Added path resolution:
```typescript
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

#### 5. Updated `tailwind.config.js`
- Added `darkMode: ["class"]` support
- Added shadcn/ui CSS variables for theming
- Added `tailwindcss-animate` plugin
- Added container configuration
- Added border radius variables

#### 6. Updated `src/index.css`
Added CSS variables for light and dark themes:
- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--popover`, `--popover-foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--destructive`, `--destructive-foreground`
- `--border`, `--input`, `--ring`
- `--radius`

### Components Added

#### Button Component (`src/components/ui/button.tsx`)
A flexible button component with multiple variants:
- **Variants**: default, destructive, outline, secondary, ghost, link
- **Sizes**: default, sm, lg, icon
- Built with Radix UI Slot for composition
- Uses class-variance-authority for variant management

**Usage Example**:
```tsx
import { Button } from "@/components/ui/button"

function MyComponent() {
  return (
    <div>
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline" size="lg">Large Outline</Button>
      <Button variant="ghost" size="sm">Small Ghost</Button>
    </div>
  )
}
```

## Adding More Components

To add additional shadcn/ui components, use the official CLI (if available in future) or manually copy components from:
https://ui.shadcn.com/docs/components

### Manual Installation Steps:
1. Copy the component code from shadcn/ui website
2. Place in `src/components/ui/[component-name].tsx`
3. Install any additional Radix UI dependencies if needed
4. Import and use: `import { Component } from "@/components/ui/component"`

### Common Radix UI Dependencies:
- `@radix-ui/react-dialog` - For Dialog, AlertDialog
- `@radix-ui/react-dropdown-menu` - For DropdownMenu
- `@radix-ui/react-select` - For Select
- `@radix-ui/react-popover` - For Popover
- `@radix-ui/react-tabs` - For Tabs
- `@radix-ui/react-tooltip` - For Tooltip

## Compatibility

### With Existing Limpopo Connect Styles
- **Preserved**: All existing Limpopo-specific colors (`limpopo-green`, `limpopo-gold`, `limpopo-blue`)
- **Preserved**: All custom animations (fade-in, slide-up, scale-in, float)
- **Preserved**: All glassmorphism and custom component styles
- **Added**: New shadcn/ui theming variables work alongside existing styles

### Migration Strategy
You can gradually adopt shadcn/ui components:
1. Keep using existing custom components (they still work)
2. Use shadcn/ui for new features
3. Optionally migrate existing components over time

## Theming

### Custom Theme Colors
The integration uses shadcn/ui's default slate color scheme. To customize:

1. Edit CSS variables in `src/index.css`
2. Use Limpopo colors:
```css
:root {
  --primary: 138 61% 29%; /* limpopo-green */
  --primary-foreground: 0 0% 100%;
}
```

### Dark Mode
Dark mode is configured and ready. To enable:
```tsx
// Add to root element
<html className="dark">
```

Or toggle dynamically with state management.

## Testing

All shadcn/ui components are tested:
- ✅ TypeScript compilation: `npm run typecheck`
- ✅ ESLint passing: `npm run lint`
- ✅ Build successful: `npm run build`

## Benefits

1. **Accessibility**: Radix UI primitives are WAI-ARIA compliant
2. **Customization**: Full control over component code
3. **Type Safety**: Full TypeScript support
4. **Performance**: Tree-shakeable, only includes what you use
5. **Styling**: Tailwind CSS integration
6. **Dark Mode**: Built-in support

## Resources

- **shadcn/ui Docs**: https://ui.shadcn.com/
- **Radix UI**: https://www.radix-ui.com/
- **Tailwind CSS**: https://tailwindcss.com/
- **CVA (Class Variance Authority)**: https://cva.style/

## Next Steps

Consider adding these commonly used components:
- [ ] Card - For content containers
- [ ] Input - For form inputs
- [ ] Label - For form labels
- [ ] Select - For dropdown selections
- [ ] Dialog - For modals
- [ ] Toast - For notifications
- [ ] Dropdown Menu - For action menus
- [ ] Tabs - For tabbed interfaces

## Support

For issues or questions about shadcn/ui integration:
1. Check official docs: https://ui.shadcn.com/docs
2. Review Radix UI docs: https://www.radix-ui.com/docs
3. Check existing components in `src/components/ui/`

---

**Last Updated**: October 12, 2025  
**Integration Status**: ✅ Complete and Production-Ready
