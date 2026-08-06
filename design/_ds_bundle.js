/* @ds-bundle: {"format":4,"namespace":"HustlrDesignSystem_3816fd","components":[{"name":"ActionBar","sourcePath":"components/commerce/ActionBar.jsx"},{"name":"ProductCard","sourcePath":"components/commerce/ProductCard.jsx"},{"name":"ProductCarousel","sourcePath":"components/commerce/ProductCarousel.jsx"},{"name":"VariantSelector","sourcePath":"components/commerce/VariantSelector.jsx"},{"name":"ColorSwatchSelector","sourcePath":"components/commerce/VariantSelector.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"RatingBadge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"TextField","sourcePath":"components/forms/TextField.jsx"},{"name":"PhoneField","sourcePath":"components/forms/TextField.jsx"},{"name":"Select","sourcePath":"components/forms/TextField.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"}],"sourceHashes":{"components/commerce/ActionBar.jsx":"7fb00690324b","components/commerce/ProductCard.jsx":"e5dcb3ae2bc4","components/commerce/ProductCarousel.jsx":"fe0c3b4a1043","components/commerce/VariantSelector.jsx":"5d2a4e76a79f","components/core/Badge.jsx":"e568398d67bf","components/core/Button.jsx":"8cde505f2f6b","components/core/IconButton.jsx":"8b7bc1e7d3f2","components/forms/Checkbox.jsx":"11042f40603a","components/forms/Radio.jsx":"4d0cb4f107a0","components/forms/Switch.jsx":"70a5a3f9adfb","components/forms/TextField.jsx":"66d8a6141f51","components/navigation/Tabs.jsx":"805a73199472","ui_kits/storefront/Cart.jsx":"5372ed4d0803","ui_kits/storefront/Checkout.jsx":"effeb8c4f395","ui_kits/storefront/Confirmation.jsx":"c52028c34e85","ui_kits/storefront/Home.jsx":"594595047646","ui_kits/storefront/PDP.jsx":"30a0dca02fe8","ui_kits/storefront/data.js":"8c0b7633ee9d"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.HustlrDesignSystem_3816fd = window.HustlrDesignSystem_3816fd || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/commerce/ActionBar.jsx
try { (() => {
function ActionBar({
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
  primaryIcon,
  secondaryIcon
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "sticky",
      bottom: 0,
      left: 0,
      right: 0,
      display: "flex",
      gap: 12,
      padding: "14px 20px",
      paddingBottom: "calc(14px + env(safe-area-inset-bottom))",
      background: "var(--surface-card)",
      borderTop: "1px solid var(--border-default)",
      fontFamily: "var(--font-sans)"
    }
  }, secondaryLabel && /*#__PURE__*/React.createElement("button", {
    onClick: onSecondary,
    style: {
      flex: "0 0 42%",
      height: 56,
      borderRadius: "var(--radius-pill)",
      border: "none",
      background: "var(--action-secondary-bg)",
      color: "var(--action-secondary-text)",
      fontWeight: "var(--fw-semibold)",
      fontSize: "var(--fs-body)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      cursor: "pointer"
    }
  }, secondaryIcon, secondaryLabel), /*#__PURE__*/React.createElement("button", {
    onClick: onPrimary,
    style: {
      flex: 1,
      height: 56,
      borderRadius: "var(--radius-pill)",
      border: "none",
      background: "var(--action-primary-bg)",
      color: "var(--action-primary-text)",
      fontWeight: "var(--fw-semibold)",
      fontSize: "var(--fs-body)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      cursor: "pointer"
    }
  }, primaryIcon, primaryLabel));
}
Object.assign(__ds_scope, { ActionBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/commerce/ActionBar.jsx", error: String((e && e.message) || e) }); }

// components/commerce/ProductCard.jsx
try { (() => {
function ProductCard({
  image,
  brand,
  title,
  price,
  comparePrice,
  discountPct,
  rating
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      fontFamily: "var(--font-sans)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      aspectRatio: "1",
      borderRadius: "var(--radius-lg)",
      background: "var(--surface-sunken)",
      overflow: "hidden"
    }
  }, image && /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: title,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  }), discountPct && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 10,
      left: 10,
      background: "var(--accent-error)",
      color: "var(--text-inverse)",
      fontSize: "var(--fs-caption)",
      fontWeight: "var(--fw-semibold)",
      padding: "4px 10px",
      borderRadius: "var(--radius-pill)"
    }
  }, "-", discountPct, "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, brand && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-caption)",
      color: "var(--text-tertiary)"
    }
  }, brand), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-body)",
      fontWeight: "var(--fw-medium)",
      color: "var(--text-primary)"
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 6,
      marginTop: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-body)",
      fontWeight: "var(--fw-bold)"
    }
  }, price), comparePrice && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-caption)",
      color: "var(--text-tertiary)",
      textDecoration: "line-through"
    }
  }, comparePrice))));
}
Object.assign(__ds_scope, { ProductCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/commerce/ProductCard.jsx", error: String((e && e.message) || e) }); }

// components/commerce/ProductCarousel.jsx
try { (() => {
const {
  useState,
  useRef
} = React;
function ProductCarousel({
  images,
  badge
}) {
  const [index, setIndex] = useState(0);
  const startX = useRef(null);
  const total = images.length;
  const go = dir => setIndex(i => (i + dir + total) % total);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: "100%",
      aspectRatio: "1",
      background: "var(--surface-sunken)",
      borderRadius: "var(--radius-lg)",
      overflow: "hidden",
      touchAction: "pan-y"
    },
    onTouchStart: e => startX.current = e.touches[0].clientX,
    onTouchEnd: e => {
      if (startX.current == null) return;
      const dx = e.changedTouches[0].clientX - startX.current;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      startX.current = null;
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: images[index],
    alt: "",
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    },
    draggable: false
  }), badge && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 14,
      left: 14,
      background: "var(--accent-error)",
      color: "var(--text-inverse)",
      fontSize: "var(--fs-caption)",
      fontWeight: "var(--fw-semibold)",
      padding: "6px 14px",
      borderRadius: "var(--radius-pill)"
    }
  }, badge), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: "50%",
      bottom: 44,
      transform: "translateX(-50%)",
      display: "flex",
      alignItems: "center",
      gap: 14,
      background: "var(--surface-card)",
      borderRadius: "var(--radius-pill)",
      padding: "8px 14px",
      boxShadow: "var(--shadow-md)"
    }
  }, /*#__PURE__*/React.createElement("button", {
    "aria-label": "rotate left",
    onClick: () => go(-1),
    style: {
      border: "none",
      background: "none",
      cursor: "pointer",
      fontSize: 16,
      color: "var(--text-primary)"
    }
  }, "\u2039"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-caption)",
      color: "var(--text-tertiary)",
      fontWeight: "var(--fw-medium)"
    }
  }, "360\xB0"), /*#__PURE__*/React.createElement("button", {
    "aria-label": "rotate right",
    onClick: () => go(1),
    style: {
      border: "none",
      background: "none",
      cursor: "pointer",
      fontSize: 16,
      color: "var(--text-primary)"
    }
  }, "\u203A")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: "50%",
      bottom: 16,
      transform: "translateX(-50%)",
      display: "flex",
      gap: 6
    }
  }, images.map((_, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      width: 6,
      height: 6,
      borderRadius: "var(--radius-pill)",
      background: i === index ? "var(--ink-900)" : "var(--ink-300)"
    }
  }))));
}
Object.assign(__ds_scope, { ProductCarousel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/commerce/ProductCarousel.jsx", error: String((e && e.message) || e) }); }

// components/commerce/VariantSelector.jsx
try { (() => {
function VariantSelector({
  options,
  value,
  onChange,
  name
}) {
  return /*#__PURE__*/React.createElement("div", {
    role: "radiogroup",
    "aria-label": name,
    style: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap"
    }
  }, options.map(opt => {
    const selected = opt.value === value;
    const disabled = opt.disabled;
    let style = {
      minWidth: 48,
      height: 44,
      padding: "0 16px",
      borderRadius: "var(--radius-pill)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-sans)",
      fontWeight: "var(--fw-semibold)",
      fontSize: "var(--fs-body)",
      cursor: disabled ? "not-allowed" : "pointer",
      border: "1px solid var(--variant-available-border)",
      background: "var(--surface-card)",
      color: "var(--variant-available-text)",
      transition: "all var(--duration-fast) var(--ease-out)"
    };
    if (selected) {
      style = {
        ...style,
        background: "var(--variant-selected-bg)",
        color: "var(--variant-selected-text)",
        border: "1px solid var(--variant-selected-bg)"
      };
    }
    if (disabled) {
      style = {
        ...style,
        background: "var(--variant-oos-bg)",
        color: "var(--variant-oos-text)",
        border: "1px solid var(--variant-oos-border)",
        textDecoration: "line-through"
      };
    }
    return /*#__PURE__*/React.createElement("button", {
      key: opt.value,
      role: "radio",
      "aria-checked": selected,
      disabled: disabled,
      onClick: () => !disabled && onChange && onChange(opt.value),
      style: style
    }, opt.label);
  }));
}
function ColorSwatchSelector({
  options,
  value,
  onChange,
  name
}) {
  return /*#__PURE__*/React.createElement("div", {
    role: "radiogroup",
    "aria-label": name,
    style: {
      display: "flex",
      gap: 12
    }
  }, options.map(opt => {
    const selected = opt.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: opt.value,
      "aria-label": opt.label,
      "aria-checked": selected,
      onClick: () => onChange && onChange(opt.value),
      style: {
        width: 36,
        height: 36,
        borderRadius: "var(--radius-pill)",
        border: selected ? "2px solid var(--variant-selected-bg)" : "1px solid var(--border-default)",
        padding: 3,
        background: "var(--surface-card)",
        cursor: "pointer"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "block",
        width: "100%",
        height: "100%",
        borderRadius: "var(--radius-pill)",
        background: opt.color
      }
    }));
  }));
}
Object.assign(__ds_scope, { VariantSelector, ColorSwatchSelector });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/commerce/VariantSelector.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
const tones = {
  sale: {
    background: "var(--accent-error)",
    color: "var(--text-inverse)"
  },
  info: {
    background: "var(--accent-info-bg)",
    color: "var(--accent-info)"
  },
  success: {
    background: "color-mix(in oklch, var(--accent-success) 15%, white)",
    color: "var(--accent-success)"
  },
  neutral: {
    background: "var(--ink-100)",
    color: "var(--text-secondary)"
  }
};
function Badge({
  children,
  tone = "neutral"
}) {
  const t = tones[tone] || tones.neutral;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      height: 28,
      padding: "0 12px",
      borderRadius: "var(--radius-pill)",
      fontFamily: "var(--font-sans)",
      fontWeight: "var(--fw-semibold)",
      fontSize: "var(--fs-body-sm)",
      ...t
    }
  }, children);
}
function RatingBadge({
  value
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      fontFamily: "var(--font-sans)",
      fontWeight: "var(--fw-semibold)",
      fontSize: "var(--fs-body-sm)",
      color: "var(--text-primary)"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "var(--accent-rating)"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01z"
  })), value);
}
Object.assign(__ds_scope, { Badge, RatingBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
const sizeStyles = {
  lg: {
    height: 56,
    padding: "0 28px",
    fontSize: "var(--fs-body-lg)"
  },
  md: {
    height: 48,
    padding: "0 22px",
    fontSize: "var(--fs-body)"
  },
  sm: {
    height: 40,
    padding: "0 16px",
    fontSize: "var(--fs-body-sm)"
  }
};
const variantStyles = {
  primary: {
    background: "var(--action-primary-bg)",
    color: "var(--action-primary-text)",
    border: "none"
  },
  secondary: {
    background: "var(--action-secondary-bg)",
    color: "var(--action-secondary-text)",
    border: "none"
  },
  ghost: {
    background: "transparent",
    color: "var(--text-primary)",
    border: "1px solid var(--action-ghost-border)"
  },
  danger: {
    background: "var(--accent-error)",
    color: "var(--text-inverse)",
    border: "none"
  }
};
function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  fullWidth = false,
  disabled = false,
  onClick,
  type = "button"
}) {
  const v = variantStyles[variant] || variantStyles.primary;
  const s = sizeStyles[size] || sizeStyles.md;
  const style = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontFamily: "var(--font-sans)",
    fontWeight: "var(--fw-semibold)",
    borderRadius: "var(--radius-pill)",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "transform var(--duration-fast) var(--ease-out), background var(--duration-fast) var(--ease-out), opacity var(--duration-fast)",
    width: fullWidth ? "100%" : undefined,
    ...s,
    ...v,
    ...(disabled ? {
      background: "var(--action-disabled-bg)",
      color: "var(--action-disabled-text)",
      border: "none"
    } : {})
  };
  return /*#__PURE__*/React.createElement("button", {
    type: type,
    disabled: disabled,
    onClick: onClick,
    style: style,
    onMouseDown: e => {
      if (!disabled) e.currentTarget.style.transform = "scale(0.97)";
    },
    onMouseUp: e => {
      e.currentTarget.style.transform = "scale(1)";
    },
    onMouseLeave: e => {
      e.currentTarget.style.transform = "scale(1)";
    }
  }, icon, children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
const sizes = {
  lg: 48,
  md: 40,
  sm: 32
};
const tones = {
  light: {
    background: "color-mix(in oklch, var(--ink-0) 88%, transparent)",
    color: "var(--text-primary)"
  },
  dark: {
    background: "var(--surface-inverse)",
    color: "var(--text-inverse)"
  },
  outline: {
    background: "transparent",
    color: "var(--text-primary)",
    border: "1px solid var(--border-default)"
  }
};
function IconButton({
  icon,
  tone = "light",
  size = "md",
  onClick,
  ariaLabel
}) {
  const d = sizes[size] || sizes.md;
  const t = tones[tone] || tones.light;
  return /*#__PURE__*/React.createElement("button", {
    "aria-label": ariaLabel,
    onClick: onClick,
    style: {
      width: d,
      height: d,
      borderRadius: "var(--radius-pill)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      border: "none",
      cursor: "pointer",
      transition: "transform var(--duration-fast) var(--ease-out)",
      ...t
    },
    onMouseDown: e => e.currentTarget.style.transform = "scale(0.92)",
    onMouseUp: e => e.currentTarget.style.transform = "scale(1)",
    onMouseLeave: e => e.currentTarget.style.transform = "scale(1)"
  }, icon);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function Checkbox({
  checked,
  onChange,
  label
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      fontFamily: "var(--font-sans)",
      fontSize: "var(--fs-body)",
      color: "var(--text-primary)",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 22,
      height: 22,
      borderRadius: "var(--radius-sm)",
      flexShrink: 0,
      border: checked ? "none" : "1.5px solid var(--border-strong)",
      background: checked ? "var(--action-secondary-bg)" : "transparent",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all var(--duration-fast) var(--ease-out)"
    }
  }, checked && /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "white",
    strokeWidth: "3"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 12l6 6L20 6"
  }))), /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: checked,
    onChange: e => onChange && onChange(e.target.checked),
    style: {
      display: "none"
    }
  }), label);
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
function Radio({
  checked,
  onChange,
  label,
  name
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      fontFamily: "var(--font-sans)",
      fontSize: "var(--fs-body)",
      color: "var(--text-primary)",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 22,
      height: 22,
      borderRadius: "var(--radius-pill)",
      flexShrink: 0,
      border: checked ? "6px solid var(--variant-selected-bg)" : "1.5px solid var(--border-strong)",
      transition: "all var(--duration-fast) var(--ease-out)"
    }
  }), /*#__PURE__*/React.createElement("input", {
    type: "radio",
    name: name,
    checked: checked,
    onChange: e => onChange && onChange(e.target.checked),
    style: {
      display: "none"
    }
  }), label);
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function Switch({
  checked,
  onChange,
  label
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      fontFamily: "var(--font-sans)",
      fontSize: "var(--fs-body)",
      color: "var(--text-primary)",
      cursor: "pointer"
    }
  }, label, /*#__PURE__*/React.createElement("span", {
    onClick: () => onChange && onChange(!checked),
    style: {
      width: 44,
      height: 26,
      borderRadius: "var(--radius-pill)",
      padding: 3,
      background: checked ? "var(--action-primary-bg)" : "var(--ink-200)",
      transition: "background var(--duration-fast) var(--ease-out)",
      display: "inline-flex",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 20,
      height: 20,
      borderRadius: "var(--radius-pill)",
      background: "var(--ink-0)",
      boxShadow: "var(--shadow-xs)",
      transform: checked ? "translateX(18px)" : "translateX(0)",
      transition: "transform var(--duration-fast) var(--ease-out)"
    }
  })));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/forms/TextField.jsx
try { (() => {
function TextField({
  label,
  placeholder,
  value,
  onChange,
  prefix,
  error,
  type = "text",
  helperText
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      fontFamily: "var(--font-sans)"
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-body-sm)",
      fontWeight: "var(--fw-medium)",
      color: "var(--text-secondary)"
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      height: 52,
      padding: "0 16px",
      borderRadius: "var(--radius-md)",
      background: "var(--surface-sunken)",
      border: error ? "1px solid var(--accent-error)" : "1px solid transparent"
    }
  }, prefix && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-tertiary)",
      fontSize: "var(--fs-body)"
    }
  }, prefix), /*#__PURE__*/React.createElement("input", {
    type: type,
    value: value,
    placeholder: placeholder,
    onChange: e => onChange && onChange(e.target.value),
    style: {
      flex: 1,
      border: "none",
      background: "transparent",
      outline: "none",
      fontSize: "var(--fs-body)",
      color: "var(--text-primary)",
      fontFamily: "var(--font-sans)"
    }
  })), error ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-caption)",
      color: "var(--accent-error)"
    }
  }, error) : helperText ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-caption)",
      color: "var(--text-tertiary)"
    }
  }, helperText) : null);
}
function PhoneField({
  value,
  onChange,
  error
}) {
  return /*#__PURE__*/React.createElement(TextField, {
    label: "Phone number",
    prefix: "+234",
    placeholder: "801 234 5678",
    value: value,
    onChange: onChange,
    error: error,
    helperText: !error ? "We'll text delivery updates to this number" : undefined,
    type: "tel"
  });
}
function Select({
  label,
  value,
  onChange,
  options,
  placeholder
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      fontFamily: "var(--font-sans)"
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-body-sm)",
      fontWeight: "var(--fw-medium)",
      color: "var(--text-secondary)"
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      height: 52,
      borderRadius: "var(--radius-md)",
      background: "var(--surface-sunken)"
    }
  }, /*#__PURE__*/React.createElement("select", {
    value: value,
    onChange: e => onChange && onChange(e.target.value),
    style: {
      width: "100%",
      height: "100%",
      border: "none",
      background: "transparent",
      outline: "none",
      padding: "0 16px",
      fontSize: "var(--fs-body)",
      color: value ? "var(--text-primary)" : "var(--text-tertiary)",
      fontFamily: "var(--font-sans)",
      appearance: "none"
    }
  }, placeholder && /*#__PURE__*/React.createElement("option", {
    value: "",
    disabled: true
  }, placeholder), options.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.value,
    value: o.value
  }, o.label))), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      right: 16,
      top: "50%",
      transform: "translateY(-50%)",
      pointerEvents: "none",
      color: "var(--text-tertiary)"
    }
  }, "\u25BE")));
}
Object.assign(__ds_scope, { TextField, PhoneField, Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/TextField.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
const {
  useState
} = React;
function Tabs({
  tabs,
  defaultValue,
  value,
  onChange
}) {
  const [internal, setInternal] = useState(defaultValue || tabs[0] && tabs[0].value);
  const active = value !== undefined ? value : internal;
  const set = v => {
    setInternal(v);
    onChange && onChange(v);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 4,
      background: "var(--surface-sunken)",
      borderRadius: "var(--radius-pill)",
      padding: 4,
      fontFamily: "var(--font-sans)"
    }
  }, tabs.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.value,
    onClick: () => set(t.value),
    style: {
      flex: 1,
      height: 40,
      border: "none",
      cursor: "pointer",
      borderRadius: "var(--radius-pill)",
      fontSize: "var(--fs-body-sm)",
      fontWeight: "var(--fw-semibold)",
      background: active === t.value ? "var(--surface-card)" : "transparent",
      color: active === t.value ? "var(--text-primary)" : "var(--text-tertiary)",
      boxShadow: active === t.value ? "var(--shadow-xs)" : "none",
      transition: "all var(--duration-fast) var(--ease-out)"
    }
  }, t.label)));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/storefront/Cart.jsx
try { (() => {
const {
  IconButton,
  Button
} = window.HustlrDesignSystem_3816fd;
const {
  formatUSD
} = window.HustlrData;
function LineItem({
  item,
  onQty,
  onRemove
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 14,
      padding: "16px 0",
      borderBottom: "1px solid var(--border-default)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 72,
      height: 72,
      borderRadius: "var(--radius-md)",
      background: "var(--surface-sunken)",
      overflow: "hidden",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: item.image,
    alt: item.title,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-body-sm)",
      fontWeight: 500,
      color: "var(--text-primary)"
    }
  }, item.title), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-caption)",
      color: "var(--text-tertiary)"
    }
  }, "Size ", item.size, " \xB7 ", item.color), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-pill)",
      padding: "2px 4px"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => onQty(item, -1),
    style: {
      width: 28,
      height: 28,
      border: "none",
      background: "none",
      cursor: "pointer",
      fontSize: 16
    }
  }, "\u2212"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-body-sm)",
      fontWeight: 600,
      minWidth: 16,
      textAlign: "center"
    }
  }, item.qty), /*#__PURE__*/React.createElement("button", {
    onClick: () => onQty(item, 1),
    style: {
      width: 28,
      height: 28,
      border: "none",
      background: "none",
      cursor: "pointer",
      fontSize: 16
    }
  }, "+")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-body)",
      fontWeight: 700
    }
  }, formatUSD(item.price * item.qty)))));
}
function CartScreen({
  items,
  onQty,
  onBack,
  onCheckout
}) {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = items.length ? 15 : 0;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      background: "var(--surface-app)",
      fontFamily: "var(--font-sans)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "20px 20px 4px",
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    ariaLabel: "back",
    tone: "outline",
    icon: /*#__PURE__*/React.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.5"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M15 18l-6-6 6-6"
    })),
    onClick: onBack
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-h2)",
      fontWeight: 700
    }
  }, "Your Cart")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      padding: "8px 20px"
    }
  }, items.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "48px 0",
      textAlign: "center",
      color: "var(--text-tertiary)",
      fontSize: "var(--fs-body-sm)"
    }
  }, "Your cart is empty.") : items.map(i => /*#__PURE__*/React.createElement(LineItem, {
    key: i.id + i.size + i.color,
    item: i,
    onQty: onQty
  }))), items.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 20px",
      borderTop: "1px solid var(--border-default)",
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: "var(--fs-body-sm)",
      color: "var(--text-secondary)"
    }
  }, /*#__PURE__*/React.createElement("span", null, "Subtotal"), /*#__PURE__*/React.createElement("span", null, formatUSD(subtotal))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: "var(--fs-body-sm)",
      color: "var(--text-secondary)"
    }
  }, /*#__PURE__*/React.createElement("span", null, "Shipping"), /*#__PURE__*/React.createElement("span", null, formatUSD(shipping))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: "var(--fs-body)",
      fontWeight: 700
    }
  }, /*#__PURE__*/React.createElement("span", null, "Total"), /*#__PURE__*/React.createElement("span", null, formatUSD(subtotal + shipping))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    fullWidth: true,
    onClick: onCheckout
  }, "Checkout"))));
}
window.CartScreen = CartScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/storefront/Cart.jsx", error: String((e && e.message) || e) }); }

// ui_kits/storefront/Checkout.jsx
try { (() => {
const {
  IconButton,
  TextField,
  PhoneField,
  Select,
  Checkbox,
  Radio,
  Button
} = window.HustlrDesignSystem_3816fd;
const {
  formatUSD
} = window.HustlrData;
function CheckoutScreen({
  items,
  onBack,
  onPlaceOrder
}) {
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [state, setState] = React.useState("");
  const [saveAddress, setSaveAddress] = React.useState(true);
  const [payment, setPayment] = React.useState("card");
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      background: "var(--surface-app)",
      fontFamily: "var(--font-sans)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "20px 20px 4px",
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    ariaLabel: "back",
    tone: "outline",
    icon: /*#__PURE__*/React.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.5"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M15 18l-6-6 6-6"
    })),
    onClick: onBack
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-h2)",
      fontWeight: 700
    }
  }, "Checkout")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      padding: "12px 20px 24px",
      display: "flex",
      flexDirection: "column",
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--fs-body-sm)",
      fontWeight: 600,
      color: "var(--text-secondary)",
      marginBottom: 10
    }
  }, "Delivery Address"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(TextField, {
    label: "Full name",
    value: name,
    onChange: setName,
    placeholder: "e.g. Amaka Obi"
  }), /*#__PURE__*/React.createElement(PhoneField, {
    value: phone,
    onChange: setPhone
  }), /*#__PURE__*/React.createElement(TextField, {
    label: "Street address",
    value: address,
    onChange: setAddress,
    placeholder: "12 Adeola Odeku Street, Victoria Island"
  }), /*#__PURE__*/React.createElement(Select, {
    label: "State",
    value: state,
    onChange: setState,
    placeholder: "Select state",
    options: [{
      value: "lagos",
      label: "Lagos"
    }, {
      value: "abuja",
      label: "Abuja (FCT)"
    }, {
      value: "rivers",
      label: "Rivers"
    }, {
      value: "oyo",
      label: "Oyo"
    }]
  }), /*#__PURE__*/React.createElement(Checkbox, {
    checked: saveAddress,
    onChange: setSaveAddress,
    label: "Save this address for next time"
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--fs-body-sm)",
      fontWeight: 600,
      color: "var(--text-secondary)",
      marginBottom: 10
    }
  }, "Payment Method"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Radio, {
    name: "pay",
    checked: payment === "card",
    onChange: () => setPayment("card"),
    label: "Card"
  }), /*#__PURE__*/React.createElement(Radio, {
    name: "pay",
    checked: payment === "transfer",
    onChange: () => setPayment("transfer"),
    label: "Bank transfer"
  }), /*#__PURE__*/React.createElement(Radio, {
    name: "pay",
    checked: payment === "cod",
    onChange: () => setPayment("cod"),
    label: "Cash on delivery"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "14px 20px",
      borderTop: "1px solid var(--border-default)",
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: "var(--fs-body)",
      fontWeight: 700
    }
  }, /*#__PURE__*/React.createElement("span", null, "Total"), /*#__PURE__*/React.createElement("span", null, formatUSD(subtotal + 15))), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    fullWidth: true,
    onClick: onPlaceOrder,
    disabled: !name || !phone || !address || !state
  }, "Place Order")));
}
window.CheckoutScreen = CheckoutScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/storefront/Checkout.jsx", error: String((e && e.message) || e) }); }

// ui_kits/storefront/Confirmation.jsx
try { (() => {
const {
  Button
} = window.HustlrDesignSystem_3816fd;
function ConfirmationScreen({
  onContinue
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
      padding: 40,
      textAlign: "center",
      fontFamily: "var(--font-sans)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 64,
      height: 64,
      borderRadius: "var(--radius-pill)",
      background: "var(--action-primary-bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "28",
    height: "28",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--action-primary-text)",
    strokeWidth: "3"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 12l6 6L20 6"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--fs-h2)",
      fontWeight: 700
    }
  }, "Order placed"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--fs-body-sm)",
      color: "var(--text-secondary)"
    }
  }, "We'll text delivery updates to your phone number."), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: onContinue
  }, "Continue shopping"));
}
window.ConfirmationScreen = ConfirmationScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/storefront/Confirmation.jsx", error: String((e && e.message) || e) }); }

// ui_kits/storefront/Home.jsx
try { (() => {
const {
  Badge,
  RatingBadge,
  Tabs
} = window.HustlrDesignSystem_3816fd;
const {
  PRODUCTS,
  formatUSD
} = window.HustlrData;
function CategoryChips({
  active,
  onChange
}) {
  const cats = ["All", "Outerwear", "Knitwear", "Accessories", "Footwear"];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      overflowX: "auto",
      paddingBottom: 4
    }
  }, cats.map(c => /*#__PURE__*/React.createElement("button", {
    key: c,
    onClick: () => onChange(c),
    style: {
      flexShrink: 0,
      height: 40,
      padding: "0 16px",
      borderRadius: "var(--radius-pill)",
      border: active === c ? "none" : "1px solid var(--border-default)",
      background: active === c ? "var(--action-secondary-bg)" : "var(--surface-card)",
      color: active === c ? "var(--action-secondary-text)" : "var(--text-primary)",
      fontFamily: "var(--font-sans)",
      fontSize: "var(--fs-body-sm)",
      fontWeight: 600,
      cursor: "pointer"
    }
  }, c)));
}
function GridCard({
  product,
  onOpen
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: () => onOpen(product),
    style: {
      textAlign: "left",
      border: "none",
      background: "none",
      padding: 0,
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      gap: 8,
      fontFamily: "var(--font-sans)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      aspectRatio: "1",
      borderRadius: "var(--radius-lg)",
      background: "var(--surface-sunken)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: product.image,
    alt: product.title,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  }), product.discountPct && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 10,
      left: 10
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "sale"
  }, "-", product.discountPct, "%"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-caption)",
      color: "var(--text-tertiary)"
    }
  }, product.brand), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-body-sm)",
      fontWeight: 500,
      color: "var(--text-primary)"
    }
  }, product.title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-body)",
      fontWeight: 700
    }
  }, formatUSD(product.price)), product.comparePrice && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-caption)",
      color: "var(--text-tertiary)",
      textDecoration: "line-through"
    }
  }, formatUSD(product.comparePrice)))));
}
function HomeScreen({
  onOpenProduct,
  cartCount,
  onOpenCart
}) {
  const [active, setActive] = React.useState("All");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      background: "var(--surface-app)",
      fontFamily: "var(--font-sans)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "20px 20px 0",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 22,
      fontWeight: 700,
      letterSpacing: "-0.02em",
      color: "var(--text-primary)"
    }
  }, "Hustlr"), /*#__PURE__*/React.createElement("button", {
    onClick: onOpenCart,
    "aria-label": "cart",
    style: {
      position: "relative",
      width: 44,
      height: 44,
      borderRadius: "var(--radius-pill)",
      border: "1px solid var(--border-default)",
      background: "var(--surface-card)",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    style: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%,-50%)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M6 6h15l-1.5 9h-12z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "9",
    cy: "20",
    r: "1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "18",
    cy: "20",
    r: "1"
  })), cartCount > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: -4,
      right: -4,
      background: "var(--accent-error)",
      color: "#fff",
      fontSize: 10,
      fontWeight: 700,
      borderRadius: "var(--radius-pill)",
      minWidth: 18,
      height: 18,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 4px"
    }
  }, cartCount))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 20px 0"
    }
  }, /*#__PURE__*/React.createElement(CategoryChips, {
    active: active,
    onChange: setActive
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      padding: "16px 20px 32px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 20
    }
  }, PRODUCTS.map(p => /*#__PURE__*/React.createElement(GridCard, {
    key: p.id,
    product: p,
    onOpen: onOpenProduct
  })))));
}
window.HomeScreen = HomeScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/storefront/Home.jsx", error: String((e && e.message) || e) }); }

// ui_kits/storefront/PDP.jsx
try { (() => {
const {
  IconButton,
  Badge,
  RatingBadge,
  VariantSelector,
  ColorSwatchSelector,
  ProductCarousel,
  ActionBar,
  Tabs
} = window.HustlrDesignSystem_3816fd;
const {
  formatUSD
} = window.HustlrData;
function PDPScreen({
  product,
  onBack,
  onAddToCart
}) {
  const [size, setSize] = React.useState("M");
  const [color, setColor] = React.useState("black");
  const [tab, setTab] = React.useState("desc");
  const frames = [product.image, product.image.replace("/600", "/601"), product.image.replace("/600", "/602")];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      background: "var(--surface-app)",
      fontFamily: "var(--font-sans)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      padding: "16px 16px 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 28,
      left: 28,
      zIndex: 2
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    ariaLabel: "back",
    tone: "light",
    icon: /*#__PURE__*/React.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.5"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M15 18l-6-6 6-6"
    })),
    onClick: onBack
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 28,
      right: 28,
      zIndex: 2,
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    ariaLabel: "save",
    tone: "light",
    icon: /*#__PURE__*/React.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M12 21s-7-4.5-9-9a5 5 0 019-3 5 5 0 019 3c-2 4.5-9 9-9 9z"
    }))
  }), /*#__PURE__*/React.createElement(IconButton, {
    ariaLabel: "share",
    tone: "light",
    icon: /*#__PURE__*/React.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M12 3v12M7 8l5-5 5 5M5 21h14"
    }))
  })), /*#__PURE__*/React.createElement(ProductCarousel, {
    images: frames,
    badge: product.discountPct ? `-${product.discountPct}%` : undefined
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "20px 20px 0",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-body-sm)",
      color: "var(--text-secondary)",
      fontWeight: 600
    }
  }, product.brand), product.rating && /*#__PURE__*/React.createElement(RatingBadge, {
    value: product.rating
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "6px 20px 0",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-h2)",
      fontWeight: 700,
      letterSpacing: "-0.01em",
      color: "var(--text-primary)"
    }
  }, product.title), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right",
      flexShrink: 0
    }
  }, product.comparePrice && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--fs-body-sm)",
      color: "var(--text-tertiary)",
      textDecoration: "line-through"
    }
  }, formatUSD(product.comparePrice)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--fs-price)",
      fontWeight: 700
    }
  }, formatUSD(product.price)))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "20px 20px 0",
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(VariantSelector, {
    name: "size",
    value: size,
    onChange: setSize,
    options: [{
      value: "XS",
      label: "XS"
    }, {
      value: "S",
      label: "S"
    }, {
      value: "M",
      label: "M"
    }, {
      value: "L",
      label: "L"
    }, {
      value: "XL",
      label: "XL",
      disabled: true
    }]
  }), /*#__PURE__*/React.createElement(ColorSwatchSelector, {
    name: "color",
    value: color,
    onChange: setColor,
    options: [{
      value: "black",
      label: "Black",
      color: "#171613"
    }, {
      value: "tan",
      label: "Tan",
      color: "#c9b79c"
    }, {
      value: "olive",
      label: "Olive",
      color: "#6b7052"
    }]
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "24px 20px 0"
    }
  }, /*#__PURE__*/React.createElement(Tabs, {
    tabs: [{
      value: "desc",
      label: "Characteristics"
    }, {
      value: "rec",
      label: "Recommended"
    }],
    value: tab,
    onChange: setTab
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 4px 32px",
      fontSize: "var(--fs-body-sm)",
      color: "var(--text-secondary)",
      lineHeight: "var(--lh-relaxed)"
    }
  }, tab === "desc" ? "Relaxed fit, brushed-back fleece, ribbed cuffs. Machine washable." : "Shown with items from the same collection — swap in a related-products rail here."))), /*#__PURE__*/React.createElement(ActionBar, {
    secondaryLabel: "AR View",
    primaryLabel: "Add to Cart",
    secondaryIcon: /*#__PURE__*/React.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "3",
      width: "7",
      height: "7",
      rx: "1"
    }), /*#__PURE__*/React.createElement("rect", {
      x: "14",
      y: "3",
      width: "7",
      height: "7",
      rx: "1"
    }), /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "14",
      width: "7",
      height: "7",
      rx: "1"
    }), /*#__PURE__*/React.createElement("rect", {
      x: "14",
      y: "14",
      width: "7",
      height: "7",
      rx: "1"
    })),
    primaryIcon: /*#__PURE__*/React.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.5"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M12 5v14M5 12h14"
    })),
    onPrimary: () => onAddToCart({
      ...product,
      size,
      color
    })
  }));
}
window.PDPScreen = PDPScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/storefront/PDP.jsx", error: String((e && e.message) || e) }); }

// ui_kits/storefront/data.js
try { (() => {
window.PRODUCTS = [{
  id: "p1",
  brand: "WinterElegance",
  title: "Light Hooded Tracksuit",
  price: 1259.00,
  comparePrice: 1510.80,
  discountPct: 20,
  rating: "4.7",
  image: "https://picsum.photos/seed/hustlr-tracksuit/600"
}, {
  id: "p2",
  brand: "Norden Studio",
  title: "Ribbed Knit Beanie",
  price: 349.00,
  image: "https://picsum.photos/seed/hustlr-beanie/600"
}, {
  id: "p3",
  brand: "Fieldwear Co.",
  title: "Quilted Utility Vest",
  price: 2199.00,
  comparePrice: 2599.00,
  discountPct: 15,
  image: "https://picsum.photos/seed/hustlr-vest/600"
}, {
  id: "p4",
  brand: "WinterElegance",
  title: "Cropped Puffer Jacket",
  price: 1899.00,
  image: "https://picsum.photos/seed/hustlr-puffer/600"
}, {
  id: "p5",
  brand: "Norden Studio",
  title: "Merino Crewneck",
  price: 799.00,
  image: "https://picsum.photos/seed/hustlr-crew/600"
}, {
  id: "p6",
  brand: "Fieldwear Co.",
  title: "Cargo Track Pants",
  price: 999.00,
  comparePrice: 1199.00,
  discountPct: 17,
  image: "https://picsum.photos/seed/hustlr-cargo/600"
}];
function formatUSD(n) {
  return "$" + n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
window.HustlrData = {
  PRODUCTS: window.PRODUCTS,
  formatUSD
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/storefront/data.js", error: String((e && e.message) || e) }); }

__ds_ns.ActionBar = __ds_scope.ActionBar;

__ds_ns.ProductCard = __ds_scope.ProductCard;

__ds_ns.ProductCarousel = __ds_scope.ProductCarousel;

__ds_ns.VariantSelector = __ds_scope.VariantSelector;

__ds_ns.ColorSwatchSelector = __ds_scope.ColorSwatchSelector;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.RatingBadge = __ds_scope.RatingBadge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.TextField = __ds_scope.TextField;

__ds_ns.PhoneField = __ds_scope.PhoneField;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
