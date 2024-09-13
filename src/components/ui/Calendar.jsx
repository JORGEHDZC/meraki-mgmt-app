// src/components/ui/Calendar.jsx
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

export function Calendar({ className = '', ...props }) {
  const [selectedDate, setSelectedDate] = useState(null);

  return (
    <div className={`relative ${className}`}>
      <DatePicker
        selected={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholderText="Select a date"
        {...props}
      />
      {selectedDate && (
        <p className="mt-2 text-gray-700">
          Selected date: {format(selectedDate, 'dd/MM/yyyy')}
        </p>
      )}
    </div>
  );
}
