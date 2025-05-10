import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
    xl: 'h-16 w-16 border-4',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-solid border-t-transparent',
        'border-blue-600',
        sizeClasses[size],
        className
      )}
    />
  );
}

interface LoadingContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function LoadingContainer({ children, className }: LoadingContainerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      {children}
    </div>
  );
}
