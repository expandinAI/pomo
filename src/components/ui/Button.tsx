'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ANIMATION, SPRING } from '@/styles/design-tokens';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const variants = {
  primary: 'bg-accent text-background light:bg-accent-dark light:text-background-light hover:opacity-90',
  secondary:
    'bg-surface light:bg-surface-dark border border-tertiary/20 light:border-tertiary-dark/20 hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10',
  ghost: 'bg-transparent hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10',
};

const sizes = {
  sm: 'h-8 px-3 text-sm',      // 32px height
  md: 'h-9 px-4 text-sm',      // 36px height
  lg: 'h-10 px-6 text-base',   // 40px height (touch target)
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium',
          'transition-colors duration-normal',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent light:focus-visible:ring-accent-dark focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        transition={{ type: 'spring', ...SPRING.default, duration: ANIMATION.fast / 1000 }}
        {...(props as HTMLMotionProps<'button'>)}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
