import React, { useState, useRef, useEffect } from 'react';

interface HourPickerProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  required?: boolean;
}

export default function HourPicker({ value, onChange, id, required = false }: HourPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Generate hours (00-23)
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  
  // Generate minutes (00-55, step 5)
  const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

  const handleTimeClick = (hour: string, minute: string) => {
    onChange(`${hour}:${minute}`);
    setIsOpen(false);
  };

  const validateTimeFormat = (time: string): boolean => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) return false;
    
    const [hours, minutes] = time.split(':').map(Number);
    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Automatische Formatierung beim Tippen
    if (newValue.length === 2 && !newValue.includes(':')) {
      onChange(newValue + ':');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Touch-Event-Handler
  useEffect(() => {
    function handleTouchOutside(event: TouchEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('touchend', handleTouchOutside);
    return () => document.removeEventListener('touchend', handleTouchOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center">
        <input
          type="text"
          id={id}
          required={required}
          value={value}
          onChange={handleInputChange}
          onClick={() => setIsOpen(true)}
          onTouchEnd={() => setIsOpen(true)}
          className={`block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm cursor-pointer
            ${validateTimeFormat(value) ? 'border-gray-300' : 'border-red-300'}`}
          placeholder="HH:MM"
          maxLength={5}
          aria-label="Zeit auswählen"
          aria-invalid={!validateTimeFormat(value)}
        />
        <span className="ml-2 text-sm text-gray-500">Uhr</span>
      </div>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-[320px] rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="p-3">
            <div className="grid grid-cols-4 gap-2 max-h-[400px] overflow-y-auto">
              {hours.map(hour => (
                minutes.map(minute => {
                  const timeStr = `${hour}:${minute}`;
                  return (
                    <button
                      key={timeStr}
                      type="button"
                      onClick={() => handleTimeClick(hour, minute)}
                      className={`px-3 py-2 text-sm rounded-md hover:bg-blue-100 text-center ${
                        value === timeStr ? 'bg-blue-500 text-white hover:bg-blue-600' : 'text-gray-700'
                      }`}
                    >
                      {timeStr} Uhr
                    </button>
                  );
                })
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
