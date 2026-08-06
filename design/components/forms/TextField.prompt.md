Text inputs for checkout and account forms. Sunken-fill style (no visible border unless erroring).

```jsx
<TextField label="Full name" value={name} onChange={setName} placeholder="e.g. Amaka Obi" />
<PhoneField value={phone} onChange={setPhone} />
<Select label="State" value={state} onChange={setState}
  options={[{value:"lagos",label:"Lagos"},{value:"abuja",label:"Abuja (FCT)"}]} />
```

`PhoneField` pre-fills the +234 country prefix for Nigerian numbers. `error` swaps the helper text for a red message and reddens the field border.
