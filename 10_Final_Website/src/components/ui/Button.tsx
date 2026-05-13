'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { ArrowRight } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva('btn', {
  variants: {
    variant: {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      ghost: 'btn-ghost',
    },
    size: {
      sm: 'h-9 px-3 text-[13px]',
      md: '',
      lg: 'h-12 px-6 text-[15px]',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  trailing?: 'arrow' | React.ReactNode | false;
  leading?: React.ReactNode;
  href?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, trailing = 'arrow', leading, href, children, ...props }, ref) => {
    const trail =
      trailing === 'arrow' ? (
        <ArrowRight className="arrow h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
      ) : trailing === false ? null : (
        trailing
      );

    const content = (
      <>
        {leading}
        <span>{children}</span>
        {trail}
      </>
    );

    if (href) {
      return (
        <a
          href={href}
          className={cn(buttonVariants({ variant, size }), className)}
          data-cursor="hover"
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        data-cursor="hover"
        {...props}
      >
        {content}
      </button>
    );
  },
);
Button.displayName = 'Button';
