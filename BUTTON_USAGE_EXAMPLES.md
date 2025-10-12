# shadcn/ui Button Component Usage Examples

This document demonstrates how to use the newly integrated shadcn/ui Button component in your Limpopo Connect application.

## Import

```tsx
import { Button } from "@/components/ui/button"
```

Note: The `@/` alias points to the `src/` directory.

## Basic Usage

### Default Button
```tsx
<Button>Click me</Button>
```

### With onClick Handler
```tsx
<Button onClick={() => console.log('Clicked!')}>
  Click me
</Button>
```

## Variants

The Button component supports 6 variants:

### Default (Primary)
```tsx
<Button variant="default">Default Button</Button>
```

### Destructive (Danger/Delete)
```tsx
<Button variant="destructive">Delete</Button>
```

### Outline
```tsx
<Button variant="outline">Outline Button</Button>
```

### Secondary
```tsx
<Button variant="secondary">Secondary</Button>
```

### Ghost (Minimal)
```tsx
<Button variant="ghost">Ghost Button</Button>
```

### Link (Text-only)
```tsx
<Button variant="link">Link Button</Button>
```

## Sizes

The Button component supports 4 sizes:

### Default Size
```tsx
<Button size="default">Default Size</Button>
```

### Small
```tsx
<Button size="sm">Small</Button>
```

### Large
```tsx
<Button size="lg">Large Button</Button>
```

### Icon (Square)
```tsx
<Button size="icon">
  <Icon />
</Button>
```

## Combining Variants and Sizes

```tsx
<Button variant="outline" size="lg">
  Large Outline Button
</Button>

<Button variant="destructive" size="sm">
  Small Delete
</Button>
```

## With Icons

Using Lucide React icons (already installed):

```tsx
import { Button } from "@/components/ui/button"
import { Mail, Download, Trash2 } from "lucide-react"

function MyComponent() {
  return (
    <div className="flex gap-4">
      {/* Icon with text */}
      <Button>
        <Mail className="mr-2 h-4 w-4" />
        Send Email
      </Button>

      {/* Icon only */}
      <Button size="icon">
        <Download className="h-4 w-4" />
      </Button>

      {/* Destructive with icon */}
      <Button variant="destructive">
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </Button>
    </div>
  )
}
```

## Disabled State

```tsx
<Button disabled>Disabled Button</Button>
```

## As Link (Using asChild)

The Button can render as any other component using the `asChild` prop:

```tsx
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

function MyComponent() {
  return (
    <Button asChild>
      <Link to="/profile">Go to Profile</Link>
    </Button>
  )
}
```

## Full Example Component

```tsx
import { Button } from "@/components/ui/button"
import { Mail, LogOut, Settings, Trash2 } from "lucide-react"

export default function ButtonDemo() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Button Examples</h1>
      
      {/* Variants */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Variants</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </section>

      {/* Sizes */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Sizes</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* With Icons */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">With Icons</h2>
        <div className="flex flex-wrap gap-4">
          <Button>
            <Mail className="mr-2 h-4 w-4" />
            Send Email
          </Button>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button size="icon" variant="ghost">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* States */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">States</h2>
        <div className="flex flex-wrap gap-4">
          <Button>Active</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>
    </div>
  )
}
```

## Integration with Existing Styles

The Button component works alongside your existing Limpopo Connect styles:

```tsx
// You can still use your existing button classes
<button className="btn-primary">Old Style Button</button>

// Or use the new shadcn/ui Button
<Button>New shadcn/ui Button</Button>

// Both work perfectly together!
```

## Custom Styling

You can add custom classes to shadcn/ui buttons:

```tsx
<Button className="bg-limpopo-green hover:bg-limpopo-green/90">
  Limpopo Green Button
</Button>

<Button className="w-full">Full Width Button</Button>

<Button className="rounded-full">Fully Rounded</Button>
```

## TypeScript Support

The Button component is fully typed:

```tsx
import { Button, ButtonProps } from "@/components/ui/button"

// You get full autocomplete and type checking
const MyButton = (props: ButtonProps) => {
  return <Button {...props} />
}
```

## Next Steps

Now that you have the Button component, consider adding:
- **Input** - Form text inputs
- **Select** - Dropdown selections  
- **Dialog** - Modal windows
- **Toast** - Notifications
- **Card** - Content containers
- **Tabs** - Tabbed interfaces

Visit https://ui.shadcn.com/docs/components to see all available components.

---

**Component**: Button  
**Documentation**: https://ui.shadcn.com/docs/components/button  
**Source**: `src/components/ui/button.tsx`  
**Dependencies**: @radix-ui/react-slot, class-variance-authority
