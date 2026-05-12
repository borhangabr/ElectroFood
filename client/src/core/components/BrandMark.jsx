// Inline bowl icon. No icon-library dependency. Inherits color from `text-*`.
// Stylized food bowl with a wisp of steam to telegraph "hot food, fast".

export default function BrandMark({ className = 'h-6 w-6 text-primary' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      {/* Steam */}
      <path d="M9 3c.7 1 .7 2 0 3M12 2.5c.7 1.2.7 2.3 0 3.5M15 3c.7 1 .7 2 0 3" opacity="0.7" />
      {/* Bowl rim */}
      <path d="M3 11h18" />
      {/* Bowl body */}
      <path d="M4 11c0 4.4 3.6 8 8 8s8-3.6 8-8" />
      {/* Inner highlight (filled splash of color) */}
      <path d="M7 13.5c.8 1.4 2.4 2.5 5 2.5" opacity="0.5" />
    </svg>
  );
}
