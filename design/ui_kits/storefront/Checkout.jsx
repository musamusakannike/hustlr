const { IconButton, TextField, PhoneField, Select, Checkbox, Radio, Button } = window.HustlrDesignSystem_3816fd;
const { formatUSD } = window.HustlrData;

function CheckoutScreen({ items, onBack, onPlaceOrder }) {
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [state, setState] = React.useState("");
  const [saveAddress, setSaveAddress] = React.useState(true);
  const [payment, setPayment] = React.useState("card");
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--surface-app)", fontFamily: "var(--font-sans)" }}>
      <div style={{ padding: "20px 20px 4px", display: "flex", alignItems: "center", gap: 12 }}>
        <IconButton ariaLabel="back" tone="outline" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>} onClick={onBack} />
        <span style={{ fontSize: "var(--fs-h2)", fontWeight: 700 }}>Checkout</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <div style={{ fontSize: "var(--fs-body-sm)", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 10 }}>Delivery Address</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <TextField label="Full name" value={name} onChange={setName} placeholder="e.g. Amaka Obi" />
            <PhoneField value={phone} onChange={setPhone} />
            <TextField label="Street address" value={address} onChange={setAddress} placeholder="12 Adeola Odeku Street, Victoria Island" />
            <Select label="State" value={state} onChange={setState} placeholder="Select state" options={[{ value: "lagos", label: "Lagos" }, { value: "abuja", label: "Abuja (FCT)" }, { value: "rivers", label: "Rivers" }, { value: "oyo", label: "Oyo" }]} />
            <Checkbox checked={saveAddress} onChange={setSaveAddress} label="Save this address for next time" />
          </div>
        </div>
        <div>
          <div style={{ fontSize: "var(--fs-body-sm)", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 10 }}>Payment Method</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Radio name="pay" checked={payment === "card"} onChange={() => setPayment("card")} label="Card" />
            <Radio name="pay" checked={payment === "transfer"} onChange={() => setPayment("transfer")} label="Bank transfer" />
            <Radio name="pay" checked={payment === "cod"} onChange={() => setPayment("cod")} label="Cash on delivery" />
          </div>
        </div>
      </div>
      <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border-default)", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--fs-body)", fontWeight: 700 }}><span>Total</span><span>{formatUSD(subtotal + 15)}</span></div>
        <Button variant="primary" size="lg" fullWidth onClick={onPlaceOrder} disabled={!name || !phone || !address || !state}>Place Order</Button>
      </div>
    </div>
  );
}

window.CheckoutScreen = CheckoutScreen;
