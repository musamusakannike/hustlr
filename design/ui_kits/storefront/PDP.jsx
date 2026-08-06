const { IconButton, Badge, RatingBadge, VariantSelector, ColorSwatchSelector, ProductCarousel, ActionBar, Tabs } = window.HustlrDesignSystem_3816fd;
const { formatUSD } = window.HustlrData;

function PDPScreen({ product, onBack, onAddToCart }) {
  const [size, setSize] = React.useState("M");
  const [color, setColor] = React.useState("black");
  const [tab, setTab] = React.useState("desc");
  const frames = [product.image, product.image.replace("/600", "/601"), product.image.replace("/600", "/602")];
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--surface-app)", fontFamily: "var(--font-sans)" }}>
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ position: "relative", padding: "16px 16px 0" }}>
          <div style={{ position: "absolute", top: 28, left: 28, zIndex: 2 }}><IconButton ariaLabel="back" tone="light" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>} onClick={onBack} /></div>
          <div style={{ position: "absolute", top: 28, right: 28, zIndex: 2, display: "flex", gap: 8 }}>
            <IconButton ariaLabel="save" tone="light" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-4.5-9-9a5 5 0 019-3 5 5 0 019 3c-2 4.5-9 9-9 9z"/></svg>} />
            <IconButton ariaLabel="share" tone="light" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v12M7 8l5-5 5 5M5 21h14"/></svg>} />
          </div>
          <ProductCarousel images={frames} badge={product.discountPct ? `-${product.discountPct}%` : undefined} />
        </div>
        <div style={{ padding: "20px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "var(--fs-body-sm)", color: "var(--text-secondary)", fontWeight: 600 }}>{product.brand}</span>
          {product.rating && <RatingBadge value={product.rating} />}
        </div>
        <div style={{ padding: "6px 20px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <span style={{ fontSize: "var(--fs-h2)", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--text-primary)" }}>{product.title}</span>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            {product.comparePrice && <div style={{ fontSize: "var(--fs-body-sm)", color: "var(--text-tertiary)", textDecoration: "line-through" }}>{formatUSD(product.comparePrice)}</div>}
            <div style={{ fontSize: "var(--fs-price)", fontWeight: 700 }}>{formatUSD(product.price)}</div>
          </div>
        </div>
        <div style={{ padding: "20px 20px 0", display: "flex", flexDirection: "column", gap: 14 }}>
          <VariantSelector name="size" value={size} onChange={setSize} options={[{ value: "XS", label: "XS" }, { value: "S", label: "S" }, { value: "M", label: "M" }, { value: "L", label: "L" }, { value: "XL", label: "XL", disabled: true }]} />
          <ColorSwatchSelector name="color" value={color} onChange={setColor} options={[{ value: "black", label: "Black", color: "#171613" }, { value: "tan", label: "Tan", color: "#c9b79c" }, { value: "olive", label: "Olive", color: "#6b7052" }]} />
        </div>
        <div style={{ padding: "24px 20px 0" }}>
          <Tabs tabs={[{ value: "desc", label: "Characteristics" }, { value: "rec", label: "Recommended" }]} value={tab} onChange={setTab} />
          <div style={{ padding: "16px 4px 32px", fontSize: "var(--fs-body-sm)", color: "var(--text-secondary)", lineHeight: "var(--lh-relaxed)" }}>
            {tab === "desc" ? "Relaxed fit, brushed-back fleece, ribbed cuffs. Machine washable." : "Shown with items from the same collection — swap in a related-products rail here."}
          </div>
        </div>
      </div>
      <ActionBar secondaryLabel="AR View" primaryLabel="Add to Cart"
        secondaryIcon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>}
        primaryIcon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>}
        onPrimary={() => onAddToCart({ ...product, size, color })}
      />
    </div>
  );
}

window.PDPScreen = PDPScreen;
