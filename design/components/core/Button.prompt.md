Pill-shaped touch-friendly button, used for primary/secondary actions across the storefront (Add to Cart, AR View, Checkout, etc).

```jsx
<Button variant="primary" size="lg" fullWidth>Add to Cart</Button>
<Button variant="secondary" size="lg" icon={<CubeIcon/>}>AR View</Button>
```

Variants: `primary` (lime, dark text), `secondary` (black, white text), `ghost` (outlined), `danger` (red, for destructive actions). Sizes: `lg` (56px, thumb-zone CTAs), `md` (48px, default), `sm` (40px, inline actions). `disabled` overrides colors to muted gray.
