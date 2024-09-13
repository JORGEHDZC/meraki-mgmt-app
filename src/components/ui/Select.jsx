// src/components/ui/Select.jsx
import { useState } from "react";
import { SelectTrigger } from "@/components/ui/SelectTrigger";
import { SelectContent } from "@/components/ui/SelectContent";
import { SelectItem } from "@/components/ui/SelectItem";
import { SelectValue } from "@/components/ui/SelectValue";

// Exporting all components from here
export { SelectTrigger, SelectContent, SelectItem, SelectValue };

// Main Select component
export function Select({ options, className = '', ...props }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(null);

  const toggleOpen = () => setIsOpen((prev) => !prev);
  const handleSelect = (value) => {
    setSelectedValue(value);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <SelectTrigger value={selectedValue} onClick={toggleOpen} />
      <SelectContent isOpen={isOpen}>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} onClick={handleSelect}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </div>
  );
}
