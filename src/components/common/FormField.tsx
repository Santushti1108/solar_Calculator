import type { ChangeEvent } from 'react';

type Option = { value: string; label: string };

interface FormFieldProps {
  label: string;
  value: string | number;
  type?: string;
  options?: Option[];
  step?: string | number;
  min?: string | number;
  max?: string | number;
  placeholder?: string;
  hint?: string;
  onChange: (value: string | number |"") => void;
}


export function FormField({ label, value, type = 'text', options, step, min, max, placeholder, hint, onChange }: FormFieldProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = event.target.value;

    if (type === "number"){
      onChange(
        value ==""
         ? ""
         : Number(value)
      );
    }else{
      onChange(value);
    }
  };

  return (
    <div className="form-group">
      <label>{label}</label>
      {options ? (
        <select value={String(value)} onChange={handleChange}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input type={type} value={type === "number" && Number(value)===0? "":value} step={step} min={min} max={max} placeholder={placeholder} onChange={handleChange} />
      )}
      {hint ? <span className="form-hint">{hint}</span> : null}
    </div>
  );
}
