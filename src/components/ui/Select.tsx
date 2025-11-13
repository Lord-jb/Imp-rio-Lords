// components/ui/Select.tsx
import type { SelectHTMLAttributes, ReactNode } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  children: ReactNode;
}

export function Select({ label, className = '', children, ...props }: SelectProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold mb-2">
          {label}
        </label>
      )}
      <select
        className={`w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-secondary ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}