import React from 'react';

export function Skeleton({ className = '', style = {} }) {
  return <span className={`ss-skeleton ${className}`} style={style} aria-hidden="true" />;
}

export function SkeletonCard({ rows = 3, style = {} }) {
  return (
    <div className="ss-card" style={{ ...style, padding: '20px' }}>
      <Skeleton className="ss-skeleton-text wide" style={{ marginBottom: 12 }} />
      <Skeleton className="ss-skeleton-text" style={{ height: 32, width: '45%', marginBottom: 12 }} />
      {rows > 2 && <Skeleton className="ss-skeleton-text short" />}
    </div>
  );
}

export function SkeletonStatGrid({ count = 5 }) {
  return (
    <div className="ss-grid-stats">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} rows={2} />
      ))}
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <div style={{ display: 'flex', gap: 16, padding: '12px 20px', alignItems: 'center' }}>
      <Skeleton style={{ width: 48, height: 14, borderRadius: 4 }} />
      <Skeleton style={{ width: 80, height: 14, borderRadius: 4 }} />
      <Skeleton style={{ flex: 1, height: 14, borderRadius: 4 }} />
      <Skeleton style={{ width: 60, height: 22, borderRadius: 999 }} />
      <Skeleton style={{ width: 48, height: 14, borderRadius: 4 }} />
    </div>
  );
}

export function SkeletonAvatar({ size = 32 }) {
  return (
    <Skeleton
      className="ss-skeleton-circle"
      style={{ width: size, height: size, flexShrink: 0 }}
    />
  );
}

export default Skeleton;
