import { cn } from '../../lib/cn';

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'tw-rounded-2xl tw-border tw-border-surface-border tw-bg-surface-raised/80 tw-text-ink tw-shadow-lg tw-backdrop-blur-sm',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('tw-flex tw-flex-col tw-gap-1.5 tw-p-6', className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cn('tw-font-display tw-text-lg tw-font-semibold tw-leading-none tw-tracking-tight', className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }) {
  return <p className={cn('tw-text-sm tw-text-ink-muted', className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn('tw-p-6 tw-pt-0', className)} {...props} />;
}
