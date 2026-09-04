export default function Card({
  children,
  className = '',
  title,
  subtitle,
  actions,
  ...props
}) {
  return (
    <section
      className={[
        'rounded-2xl border border-slate-700/60 bg-slate-900/70 backdrop-blur-sm',
        className,
      ].join(' ')}
      {...props}
    >
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-700/50 px-5 py-4">
          <div>
            {title && (
              <h3 className="font-display text-base font-semibold text-slate-50">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>
            )}
          </div>
          {actions}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}
