// components/ui/Card.tsx
import type { ReactNode } from 'react' ;

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-soft ${className}`}>
      {children}
    </div>
  );
}
