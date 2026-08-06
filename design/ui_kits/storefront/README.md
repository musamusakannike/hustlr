# Hustlr Storefront UI Kit

Click-through recreation of a Hustlr tenant storefront (fashion vertical), built on the Hustlr Design System components. Original extrapolation from a single PDP reference screenshot — see root `readme.md` Caveats section.

Screens (`index.html` navigates between them with React state, no router):
- **Home / PLP** (`Home.jsx`) — category chips, 2-column product grid.
- **PDP** (`PDP.jsx`) — matches the reference: 360°-style carousel, sale tag, size/color variants, fixed AR View / Add to Cart action bar.
- **Cart** (`Cart.jsx`) — line items with quantity steppers, subtotal/shipping/total.
- **Checkout** (`Checkout.jsx`) — Nigerian phone/address fields, state select, payment method.
- **Confirmation** (`Confirmation.jsx`) — order-placed state.

Shared demo data lives in `data.js` (placeholder photography via picsum.photos — replace with real product imagery).
