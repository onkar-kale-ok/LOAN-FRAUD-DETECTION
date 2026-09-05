export default function Badge({ children, className = '', ...props }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold tracking-wide',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </span>
  );
}
