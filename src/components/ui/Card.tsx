// components/ui/Card.tsx
import type { ReactNode };

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white border border-neutral-200 rounded-xl p-6 shadow-soft ${className}`}>
      {children}
    </div>
  );
}
