'use client';

import { cn } from '@/app/lib/utils';
import { ButtonHTMLAttributes, InputHTMLAttributes, HTMLAttributes, forwardRef } from 'react';

// Button
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-[hsl(142,76%,36%)] text-white hover:bg-[hsl(142,76%,30%)] shadow-lg shadow-green-500/20': variant === 'default',
            'bg-[hsl(240,3.7%,15.9%)] text-white hover:bg-[hsl(240,3.7%,20%)]': variant === 'secondary',
            'border border-[hsl(240,3.7%,15.9%)] bg-transparent hover:bg-[hsl(240,3.7%,15.9%)] hover:text-white': variant === 'outline',
            'hover:bg-[hsl(240,3.7%,15.9%)] hover:text-white': variant === 'ghost',
            'bg-red-600 text-white hover:bg-red-700': variant === 'destructive',
          },
          {
            'h-10 px-4 py-2': size === 'default',
            'h-9 rounded-md px-3': size === 'sm',
            'h-11 rounded-lg px-8': size === 'lg',
            'h-10 w-10': size === 'icon',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

// Card
interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border border-[hsl(240,3.7%,15.9%)] bg-[hsl(240,10%,5%)] text-white shadow-lg',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-4', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-[hsl(240,5%,64.9%)]', className)} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-4 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

// Input
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-lg border border-[hsl(240,3.7%,15.9%)] bg-[hsl(240,10%,8%)] px-3 py-2 text-sm text-white placeholder:text-[hsl(240,5%,50%)] focus:outline-none focus:ring-2 focus:ring-[hsl(142,76%,36%)] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = 'Input';

// Badge
interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive';
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        {
          'bg-[hsl(142,76%,36%)] text-white': variant === 'default',
          'bg-[hsl(240,3.7%,15.9%)] text-[hsl(240,5%,64.9%)]': variant === 'secondary',
          'bg-green-500/20 text-green-400': variant === 'success',
          'bg-yellow-500/20 text-yellow-400': variant === 'warning',
          'bg-red-500/20 text-red-400': variant === 'destructive',
        },
        className
      )}
      {...props}
    />
  )
);
Badge.displayName = 'Badge';

// Progress
interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-[hsl(240,3.7%,15.9%)]', className)}
      {...props}
    >
      <div
        className="h-full bg-[hsl(142,76%,36%)] transition-all"
        style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
      />
    </div>
  )
);
Progress.displayName = 'Progress';

// Select
interface SelectProps extends HTMLAttributes<HTMLSelectElement> {
  value?: string;
  onValueChange?: (value: string) => void;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps & { children: React.ReactNode }>(
  ({ className, children, onValueChange, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-lg border border-[hsl(240,3.7%,15.9%)] bg-[hsl(240,10%,8%)] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[hsl(142,76%,36%)] focus:border-transparent',
        className
      )}
      onChange={(e) => onValueChange?.(e.target.value)}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = 'Select';

// Tabs (simple implementation)
interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

import { createContext, useContext, useState } from 'react';

const TabsContext = createContext<TabsContextType | null>(null);

export function Tabs({ defaultValue, children, className }: { defaultValue: string; children: React.ReactNode; className?: string }) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('inline-flex h-10 items-center justify-center rounded-lg bg-[hsl(240,10%,8%)] p-1', className)}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const context = useContext(TabsContext);
  if (!context) return null;
  
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all',
        context.activeTab === value
          ? 'bg-[hsl(142,76%,36%)] text-white shadow-sm'
          : 'text-[hsl(240,5%,64.9%)] hover:text-white',
        className
      )}
      onClick={() => context.setActiveTab(value)}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const context = useContext(TabsContext);
  if (!context || context.activeTab !== value) return null;
  
  return <div className={cn('mt-4 animate-fade-in', className)}>{children}</div>;
}
