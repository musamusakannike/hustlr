window.PRODUCTS = [
  { id: "p1", brand: "WinterElegance", title: "Light Hooded Tracksuit", price: 1259.00, comparePrice: 1510.80, discountPct: 20, rating: "4.7", image: "https://picsum.photos/seed/hustlr-tracksuit/600" },
  { id: "p2", brand: "Norden Studio", title: "Ribbed Knit Beanie", price: 349.00, image: "https://picsum.photos/seed/hustlr-beanie/600" },
  { id: "p3", brand: "Fieldwear Co.", title: "Quilted Utility Vest", price: 2199.00, comparePrice: 2599.00, discountPct: 15, image: "https://picsum.photos/seed/hustlr-vest/600" },
  { id: "p4", brand: "WinterElegance", title: "Cropped Puffer Jacket", price: 1899.00, image: "https://picsum.photos/seed/hustlr-puffer/600" },
  { id: "p5", brand: "Norden Studio", title: "Merino Crewneck", price: 799.00, image: "https://picsum.photos/seed/hustlr-crew/600" },
  { id: "p6", brand: "Fieldwear Co.", title: "Cargo Track Pants", price: 999.00, comparePrice: 1199.00, discountPct: 17, image: "https://picsum.photos/seed/hustlr-cargo/600" },
];

function formatUSD(n) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
window.HustlrData = { PRODUCTS: window.PRODUCTS, formatUSD };
