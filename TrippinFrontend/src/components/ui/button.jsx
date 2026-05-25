import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/cn';

const buttonVariants = cva(
  'tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-whitespace-nowrap tw-rounded-xl tw-text-sm tw-font-semibold tw-transition-all focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-ocean-400/50 disabled:tw-pointer-events-none disabled:tw-opacity-50',
  {
    variants: {
      variant: {
        default: 'tw-bg-terra-400 tw-text-white hover:tw-bg-terra-500 tw-shadow-md',
        secondary: 'tw-border tw-border-surface-border tw-bg-surface-raised tw-text-ink hover:tw-bg-white/5',
        ghost: 'tw-text-ink-muted hover:tw-bg-white/5 hover:tw-text-ink',
        outline: 'tw-border tw-border-terra-400/40 tw-bg-transparent tw-text-terra-400 hover:tw-bg-terra-400/10',
      },
      size: {
        default: 'tw-h-10 tw-px-4 tw-py-2',
        sm: 'tw-h-8 tw-rounded-lg tw-px-3 tw-text-xs',
        lg: 'tw-h-11 tw-rounded-xl tw-px-6',
        icon: 'tw-h-9 tw-w-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

export function UiButton({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
