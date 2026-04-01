import * as stylex from "@stylexjs/stylex";
import { useCallback, useEffect, useRef, useState } from "react";

const styles = stylex.create({
  rangeTrack: {
    position: "relative",
    flex: 1,
    height: "28px",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    touchAction: "none",
  },
  rangeLine: {
    width: "100%",
    height: "6px",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: "3px",
    position: "relative",
  },
  rangeFill: {
    position: "absolute",
    height: "100%",
    backgroundColor: "rgba(59, 130, 246, 0.6)",
    borderRadius: "3px",
    top: 0,
    left: 0,
    overflow: "hidden",
  },
  rangeThumb: {
    position: "absolute",
    width: "16px",
    height: "16px",
    backgroundColor: "white",
    borderRadius: "50%",
    top: "50%",
    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
    transform: "translate(-50%, -50%)",
    pointerEvents: "none",
    transition: "box-shadow 0.15s ease",
  },
  rangeThumbActive: {
    boxShadow: "0 2px 8px rgba(59, 130, 246, 0.5)",
  },
});

interface RangeProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  "aria-label"?: string;
}

export default function Range({
  min,
  max,
  value,
  onChange,
  "aria-label": ariaLabel,
}: RangeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const calculateValue = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const percentage = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / rect.width),
      );
      const newValue = Math.round(min + percentage * (max - min));
      onChange(newValue);
    },
    [min, max, onChange],
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    calculateValue(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    calculateValue(e.touches[0].clientX);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => calculateValue(e.clientX);
    const handleMouseUp = () => setIsDragging(false);
    const handleTouchMove = (e: TouchEvent) =>
      calculateValue(e.touches[0].clientX);
    const handleTouchEnd = () => setIsDragging(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, calculateValue]);

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div
      ref={trackRef}
      {...stylex.props(styles.rangeTrack)}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      role="slider"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
          onChange(Math.max(min, value - 1));
        } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
          onChange(Math.min(max, value + 1));
        }
      }}
      aria-label={ariaLabel}
    >
      <div {...stylex.props(styles.rangeLine)}>
        <div
          {...stylex.props(styles.rangeFill)}
          style={{ width: `${percentage}%` }}
        />
        <div
          {...stylex.props(
            styles.rangeThumb,
            isDragging && styles.rangeThumbActive,
          )}
          style={{ left: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
