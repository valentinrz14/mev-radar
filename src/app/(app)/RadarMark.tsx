export function RadarMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" role="img">
      <circle cx="16" cy="16" r="14.5" stroke="var(--ink)" strokeWidth="1.4" opacity="0.55" />
      <circle cx="16" cy="16" r="9.5" stroke="var(--ink)" strokeWidth="1.2" opacity="0.4" />
      <circle cx="16" cy="16" r="4.5" stroke="var(--signal)" strokeWidth="1.4" opacity="0.8" />
      <circle cx="16" cy="16" r="2" fill="var(--signal)" />
    </svg>
  );
}
