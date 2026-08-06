const { Badge, RatingBadge, Tabs } = window.HustlrDesignSystem_3816fd;
const { PRODUCTS, formatUSD } = window.HustlrData;

function CategoryChips({ active, onChange }) {
  const cats = ["All", "Outerwear", "Knitwear", "Accessories", "Footwear"];
  return (
    <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
      {cats.map((c) => (
        <button key={c} onClick={() => onChange(c)} style={{
          flexShrink: 0, height: 40, padding: "0 16px", borderRadius: "var(--radius-pill)",
          border: active === c ? "none" : "1px solid var(--border-default)",
          background: active === c ? "var(--action-secondary-bg)" : "var(--surface-card)",
          color: active === c ? "var(--action-secondary-text)" : "var(--text-primary)",
          fontFamily: "var(--font-sans)", fontSize: "var(--fs-body-sm)", fontWeight: 600, cursor: "pointer",
        }}>{c}</button>
      ))}
    </div>
  );
}

function GridCard({ product, onOpen }) {
  return (
    <button onClick={() => onOpen(product)} style={{ textAlign: "left", border: "none", background: "none", padding: 0, cursor: "pointer", display: "flex", flexDirection: "column", gap: 8, fontFamily: "var(--font-sans)" }}>
      <div style={{ position: "relative", aspectRatio: "1", borderRadius: "var(--radius-lg)", background: "var(--surface-sunken)", overflow: "hidden" }}>
        <img src={product.image} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        {product.discountPct && (
          <span style={{ position: "absolute", top: 10, left: 10 }}>
            <Badge tone="sale">-{product.discountPct}%</Badge>
          </span>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontSize: "var(--fs-caption)", color: "var(--text-tertiary)" }}>{product.brand}</span>
        <span style={{ fontSize: "var(--fs-body-sm)", fontWeight: 500, color: "var(--text-primary)" }}>{product.title}</span>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontSize: "var(--fs-body)", fontWeight: 700 }}>{formatUSD(product.price)}</span>
          {product.comparePrice && <span style={{ fontSize: "var(--fs-caption)", color: "var(--text-tertiary)", textDecoration: "line-through" }}>{formatUSD(product.comparePrice)}</span>}
        </div>
      </div>
    </button>
  );
}

function HomeScreen({ onOpenProduct, cartCount, onOpenCart }) {
  const [active, setActive] = React.useState("All");
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--surface-app)", fontFamily: "var(--font-sans)" }}>
      <div style={{ padding: "20px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>Hustlr</span>
        <button onClick={onOpenCart} aria-label="cart" style={{ position: "relative", width: 44, height: 44, borderRadius: "var(--radius-pill)", border: "1px solid var(--border-default)", background: "var(--surface-card)", cursor: "pointer" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}><path d="M6 6h15l-1.5 9h-12z"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>
          {cartCount > 0 && <span style={{ position: "absolute", top: -4, right: -4, background: "var(--accent-error)", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: "var(--radius-pill)", minWidth: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>{cartCount}</span>}
        </button>
      </div>
      <div style={{ padding: "16px 20px 0" }}>
        <CategoryChips active={active} onChange={setActive} />
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {PRODUCTS.map((p) => <GridCard key={p.id} product={p} onOpen={onOpenProduct} />)}
        </div>
      </div>
    </div>
  );
}

window.HomeScreen = HomeScreen;
