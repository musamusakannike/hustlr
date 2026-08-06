const { IconButton, Button } = window.HustlrDesignSystem_3816fd;
const { formatUSD } = window.HustlrData;

function LineItem({ item, onQty, onRemove }) {
  return (
    <div style={{ display: "flex", gap: 14, padding: "16px 0", borderBottom: "1px solid var(--border-default)" }}>
      <div style={{ width: 72, height: 72, borderRadius: "var(--radius-md)", background: "var(--surface-sunken)", overflow: "hidden", flexShrink: 0 }}>
        <img src={item.image} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontSize: "var(--fs-body-sm)", fontWeight: 500, color: "var(--text-primary)" }}>{item.title}</span>
        <span style={{ fontSize: "var(--fs-caption)", color: "var(--text-tertiary)" }}>Size {item.size} · {item.color}</span>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid var(--border-default)", borderRadius: "var(--radius-pill)", padding: "2px 4px" }}>
            <button onClick={() => onQty(item, -1)} style={{ width: 28, height: 28, border: "none", background: "none", cursor: "pointer", fontSize: 16 }}>−</button>
            <span style={{ fontSize: "var(--fs-body-sm)", fontWeight: 600, minWidth: 16, textAlign: "center" }}>{item.qty}</span>
            <button onClick={() => onQty(item, 1)} style={{ width: 28, height: 28, border: "none", background: "none", cursor: "pointer", fontSize: 16 }}>+</button>
          </div>
          <span style={{ fontSize: "var(--fs-body)", fontWeight: 700 }}>{formatUSD(item.price * item.qty)}</span>
        </div>
      </div>
    </div>
  );
}

function CartScreen({ items, onQty, onBack, onCheckout }) {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = items.length ? 15 : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--surface-app)", fontFamily: "var(--font-sans)" }}>
      <div style={{ padding: "20px 20px 4px", display: "flex", alignItems: "center", gap: 12 }}>
        <IconButton ariaLabel="back" tone="outline" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>} onClick={onBack} />
        <span style={{ fontSize: "var(--fs-h2)", fontWeight: 700 }}>Your Cart</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 20px" }}>
        {items.length === 0 ? (
          <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-tertiary)", fontSize: "var(--fs-body-sm)" }}>Your cart is empty.</div>
        ) : items.map((i) => <LineItem key={i.id + i.size + i.color} item={i} onQty={onQty} />)}
      </div>
      {items.length > 0 && (
        <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border-default)", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--fs-body-sm)", color: "var(--text-secondary)" }}><span>Subtotal</span><span>{formatUSD(subtotal)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--fs-body-sm)", color: "var(--text-secondary)" }}><span>Shipping</span><span>{formatUSD(shipping)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--fs-body)", fontWeight: 700 }}><span>Total</span><span>{formatUSD(subtotal + shipping)}</span></div>
          <div style={{ marginTop: 6 }}><Button variant="primary" size="lg" fullWidth onClick={onCheckout}>Checkout</Button></div>
        </div>
      )}
    </div>
  );
}

window.CartScreen = CartScreen;
