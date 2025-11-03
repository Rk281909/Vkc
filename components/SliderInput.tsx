import React, { useState, useEffect } from 'react';

interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  unit: string;
}

const SliderInput: React.FC<SliderInputProps> = ({ label, value, min, max, step, onChange, unit }) => {
  // Local state for the text input to allow for intermediate typing states (e.g., empty string)
  const [inputValue, setInputValue] = useState(value.toString());

  // Sync local state when the parent's value prop changes
  useEffect(() => {
    // Only update if the new value is different from the current input value to avoid overriding user input
    if (parseFloat(inputValue) !== value) {
      setInputValue(value.toString());
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    const numValue = parseFloat(e.target.value);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onChange(numValue);
    }
  };

  const handleInputBlur = () => {
    let numValue = parseFloat(inputValue);

    if (isNaN(numValue) || numValue < min) {
      numValue = min;
    } else if (numValue > max) {
      numValue = max;
    }
    
    setInputValue(numValue.toString());
    // This second onChange call ensures the final, validated value is propagated
    if (value !== numValue) {
        onChange(numValue);
    }
  };
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const numValue = parseFloat(e.target.value);
      setInputValue(numValue.toString());
      onChange(numValue);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="font-medium text-gray-300">{label}</label>
        <div className="flex items-center bg-brand-secondary rounded-md w-36">
          {unit === '₹' && <span className="pl-3 text-gray-400">₹</span>}
          <input
            type="number"
            value={inputValue}
            min={min}
            max={max}
            step={step}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={(e) => { if(e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
            className="bg-transparent w-full text-right px-2 py-1 text-brand-accent font-semibold focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          {unit !== '₹' && <span className="pr-3 text-gray-400">{unit}</span>}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleSliderChange}
        className="w-full h-2 bg-brand-secondary rounded-lg appearance-none cursor-pointer accent-brand-primary"
      />
    </div>
  );
};

export default SliderInput;
