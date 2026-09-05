import { forwardRef } from 'react';

const variants = {
  primary:
    'bg-teal-500 text-slate-950 hover:bg-teal-400 focus-visible:ring-teal-400/60 shadow-lg shadow-teal-500/20',
  secondary:
    'bg-slate-800 text-slate-100 hover:bg-slate-700 focus-visible:ring-slate-400/40 ring-1 ring-slate-600/60',
  ghost:
    'bg-transparent text-slate-300 hover:bg-slate-800/80 hover:text-white focus-visible:ring-slate-400/30',
  danger:
    'bg-rose-600 text-white hover:bg-rose-500 focus-visible:ring-rose-400/50',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
};

const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    type = 'button',
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
