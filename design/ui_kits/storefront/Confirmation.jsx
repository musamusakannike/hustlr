const { Button } = window.HustlrDesignSystem_3816fd;

function ConfirmationScreen({ onContinue }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", alignItems: "center", justifyContent: "center", gap: 16, padding: 40, textAlign: "center", fontFamily: "var(--font-sans)" }}>
      <div style={{ width: 64, height: 64, borderRadius: "var(--radius-pill)", background: "var(--action-primary-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--action-primary-text)" strokeWidth="3"><path d="M4 12l6 6L20 6"/></svg>
      </div>
      <div style={{ fontSize: "var(--fs-h2)", fontWeight: 700 }}>Order placed</div>
      <div style={{ fontSize: "var(--fs-body-sm)", color: "var(--text-secondary)" }}>We'll text delivery updates to your phone number.</div>
      <Button variant="secondary" onClick={onContinue}>Continue shopping</Button>
    </div>
  );
}

window.ConfirmationScreen = ConfirmationScreen;
