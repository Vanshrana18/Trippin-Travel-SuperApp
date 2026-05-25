import { cva } from 'class-variance-authority';
import { cn } from '../../lib/cn';

const badgeVariants = cva(
  'tw-inline-flex tw-items-center tw-gap-1 tw-rounded-full tw-border tw-px-2.5 tw-py-0.5 tw-text-xs tw-font-semibold tw-transition-colors',
  {
    variants: {
      variant: {
        default: 'tw-border-surface-border tw-bg-surface-raised tw-text-ink-muted',
        terra: 'tw-border-terra-400/30 tw-bg-terra-400/10 tw-text-terra-400',
        ocean: 'tw-border-ocean-400/30 tw-bg-ocean-400/10 tw-text-ocean-400',
        success: 'tw-border-success/30 tw-bg-success/10 tw-text-success',
        warning: 'tw-border-warning/30 tw-bg-warning/10 tw-text-warning',
        danger: 'tw-border-danger/30 tw-bg-danger/10 tw-text-danger',
        outline: 'tw-border-surface-border tw-bg-transparent tw-text-ink-muted',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
