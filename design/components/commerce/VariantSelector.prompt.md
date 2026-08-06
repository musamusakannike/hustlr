Rounded-rectangle token group for size/color variant selection on the PDP. Three states: selected (blue fill), available (outlined), out of stock (grayed, struck-through, disabled).

```jsx
<VariantSelector name="size" value="M" onChange={setSize}
  options={[{value:"XS",label:"XS"},{value:"M",label:"M"},{value:"XL",label:"XL",disabled:true}]} />
<ColorSwatchSelector name="color" value="black" onChange={setColor}
  options={[{value:"black",label:"Black",color:"#111"}]} />
```
