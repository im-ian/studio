import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";

import type { FilterType } from "../../../store/imageAtoms";
import { fontSize, radius, spacing } from "../../../tokens.stylex";
import IconButton from "../../ui/IconButton";
import Range from "../../ui/Range";
import SubmenuContainer from "./SubmenuContainer";

const styles = stylex.create({
  filterGroup: {
    display: "flex",
    gap: spacing.small,
    alignItems: "center",
    flexWrap: "wrap",
  },
  controlsGroup: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.small,
    width: "100%",
    paddingTop: spacing.small,
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
  },
  sliderContainer: {
    display: "flex",
    alignItems: "center",
    gap: spacing.small,
    width: "100%",
  },
  sliderLabel: {
    fontSize: fontSize.xxsmall,
    color: "white",
    minWidth: "28px",
  },
  applyButton: {
    width: "100%",
    padding: `${spacing.small} ${spacing.small}`,
    backgroundColor: "rgba(59, 130, 246, 0.3)",
    color: "#93bbfd",
    borderRadius: radius.sm,
    fontSize: fontSize.small,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: "rgba(59, 130, 246, 0.45)",
    },
    ":active": {
      transform: "translateY(0)",
    },
  },
});

const FILTERS: { type: FilterType; label: string }[] = [
  { type: "grayscale", label: "흑백" },
  { type: "sepia", label: "세피아" },
  { type: "vintage", label: "빈티지" },
  { type: "film", label: "필름" },
  { type: "cool", label: "쿨톤" },
  { type: "warm", label: "웜톤" },
  { type: "fade", label: "페이드" },
  { type: "highlight", label: "하이라이트" },
  { type: "shadow", label: "그림자" },
];

interface FilterSubmenuProps {
  isExiting?: boolean;
  onApplyFilter?: (filter: FilterType, intensity: number) => void;
  onPreviewFilter?: (filter: FilterType, intensity: number) => void;
  onCancelPreview?: () => void;
}

export default function FilterSubmenu({
  isExiting,
  onApplyFilter,
  onPreviewFilter,
  onCancelPreview,
}: FilterSubmenuProps) {
  const [selectedFilter, setSelectedFilter] = useState<FilterType | null>(null);
  const [intensity, setIntensity] = useState(100);

  // Live preview when filter or intensity changes
  useEffect(() => {
    if (selectedFilter) {
      onPreviewFilter?.(selectedFilter, intensity);
    }
  }, [selectedFilter, intensity, onPreviewFilter]);

  const handleFilterClick = (filter: FilterType) => {
    if (selectedFilter === filter) {
      onCancelPreview?.();
      setSelectedFilter(null);
    } else {
      if (selectedFilter) {
        // Cancel previous preview before starting a new one
        onCancelPreview?.();
      }
      setSelectedFilter(filter);
      setIntensity(100);
    }
  };

  const handleApply = () => {
    if (selectedFilter && onApplyFilter) {
      onApplyFilter(selectedFilter, intensity);
      setSelectedFilter(null);
      setIntensity(100);
    }
  };

  return (
    <SubmenuContainer isExiting={isExiting}>
      <div {...stylex.props(styles.filterGroup)}>
        {FILTERS.map(({ type, label }) => (
          <IconButton
            key={type}
            isActive={selectedFilter === type}
            onClick={() => handleFilterClick(type)}
          >
            {label}
          </IconButton>
        ))}
      </div>

      {selectedFilter && (
        <div {...stylex.props(styles.controlsGroup)}>
          <div {...stylex.props(styles.sliderContainer)}>
            <span {...stylex.props(styles.sliderLabel)}>강도</span>
            <Range
              min={0}
              max={100}
              value={intensity}
              onChange={setIntensity}
              aria-label="Filter intensity"
            />
            <span {...stylex.props(styles.sliderLabel)}>{intensity}%</span>
          </div>
          <button
            type="button"
            {...stylex.props(styles.applyButton)}
            onClick={handleApply}
          >
            적용
          </button>
        </div>
      )}
    </SubmenuContainer>
  );
}
