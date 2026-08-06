Radio button, dot fills blue when selected. Used for payment method and single-choice checkout options.

```jsx
<Radio name="pay" checked={method==="card"} onChange={()=>setMethod("card")} label="Card" />
```
