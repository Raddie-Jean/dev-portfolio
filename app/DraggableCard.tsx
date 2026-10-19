"use client";

import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  type ReactNode,
  useRef,
  useState,
} from "react";

export function DraggableCard({
  className = "",
  initialX = 0,
  initialY = 0,
  zIndex,
  onFocus,
  label,
  boundaryRef,
  boundaryPadding = 12,
  children,
}: {
  className?: string;
  initialX?: number;
  initialY?: number;
  zIndex: number;
  onFocus: () => void;
  label: string;
  boundaryRef?: RefObject<HTMLElement | null>;
  boundaryPadding?: number;
  children: ReactNode;
}) {
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  } | null>(null);
  const [position, setPosition] = useState({ x: initialX, y: initialY });

  const startDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (
      window.matchMedia("(max-width: 1100px)").matches ||
      event.button !== 0 ||
      (event.target as HTMLElement).closest("button, a, input, textarea")
    ) {
      return;
    }
    onFocus();
    const cardBounds = event.currentTarget.getBoundingClientRect();
    const boundaryBounds = boundaryRef?.current?.getBoundingClientRect();
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
      minX: boundaryBounds
        ? position.x + boundaryBounds.left + boundaryPadding - cardBounds.left
        : Number.NEGATIVE_INFINITY,
      maxX: boundaryBounds
        ? position.x + boundaryBounds.right - boundaryPadding - cardBounds.right
        : Number.POSITIVE_INFINITY,
      minY: boundaryBounds
        ? position.y + boundaryBounds.top + boundaryPadding - cardBounds.top
        : Number.NEGATIVE_INFINITY,
      maxY: boundaryBounds
        ? position.y + boundaryBounds.bottom - boundaryPadding - cardBounds.bottom
        : Number.POSITIVE_INFINITY,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  const moveCard = (event: ReactPointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const nextX = drag.originX + event.clientX - drag.startX;
    const nextY = drag.originY + event.clientY - drag.startY;
    setPosition({
      x: Math.min(Math.max(nextX, drag.minX), drag.maxX),
      y: Math.min(Math.max(nextY, drag.minY), drag.maxY),
    });
  };

  const stopDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <article
      className={`about-card ${className}`}
      aria-label={label}
      style={
        {
          "--card-x": `${position.x}px`,
          "--card-y": `${position.y}px`,
          zIndex,
        } as CSSProperties
      }
      onPointerDown={startDrag}
      onPointerMove={moveCard}
      onPointerUp={stopDrag}
      onPointerCancel={stopDrag}
    >
      {children}
    </article>
  );
}
