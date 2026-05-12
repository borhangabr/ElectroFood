// Card wrapper used by Login + Register pages. Keeps shared styling in one place.
export default function AuthForm({ title, subtitle, onSubmit, children, footer }) {
  return (
    <div className="container-app flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-card bg-surface p-8 shadow-soft">
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          {children}
        </form>
        {footer && <div className="mt-6 text-center text-sm text-ink-muted">{footer}</div>}
      </div>
    </div>
  );
}
