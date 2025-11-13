import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-200">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-lg bg-neutral-800 border border-neutral-700 text-gray-100 placeholder-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary focus:outline-none transition-all px-3 py-2',
            className
          )}
          {...props}
        />
      </div>
    )
  }
)

Input.displayName = 'Input'
