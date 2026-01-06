import { useRef, ReactNode } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualizedTableProps<T> {
  data: T[];
  rowHeight?: number;
  overscan?: number;
  renderRow: (item: T, index: number) => ReactNode;
  className?: string;
  containerHeight?: number;
}

export function VirtualizedTable<T>({
  data,
  rowHeight = 50,
  overscan = 5,
  renderRow,
  className = '',
  containerHeight = 600,
}: VirtualizedTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan,
  });

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{ height: `${containerHeight}px` }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {renderRow(data[virtualRow.index], virtualRow.index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Hook para tablas con altura dinámica
export function useVirtualizedTable<T>(
  data: T[],
  containerRef: React.RefObject<HTMLDivElement>,
  estimateSize: (index: number) => number,
  overscan = 5
) {
  return useVirtualizer({
    count: data.length,
    getScrollElement: () => containerRef.current,
    estimateSize,
    overscan,
    measureElement:
      typeof window !== 'undefined' && navigator.userAgent.indexOf('Firefox') === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
  });
}
