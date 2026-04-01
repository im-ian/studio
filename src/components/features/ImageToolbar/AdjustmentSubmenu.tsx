import * as stylex from "@stylexjs/stylex";
import { useCallback, useEffect, useState } from "react";

import {
  type AdjustmentValues,
  DEFAULT_ADJUSTMENTS,
} from "../../../store/imageAtoms";
import { fontSize, radius, spacing } from "../../../tokens.stylex";
import IconButton from "../../ui/IconButton";
import Range from "../../ui/Range";
import SubmenuContainer from "./SubmenuContainer";

const styles = stylex.create({
  optionGroup: {
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
    fontSize: fontSize.small,
    color: "white",
    minWidth: "28px",
  },
  valueInput: {
    width: "52px",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    color: "white",
    fontSize: fontSize.small,
    padding: `4px 6px`,
    borderRadius: radius.sm,
    textAlign: "center",
    outline: "none",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    flexShrink: 0,
    ":focus": {
      borderColor: "rgba(59, 130, 246, 0.5)",
    },
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
  },
});

const ADJUSTMENTS: {
  key: keyof AdjustmentValues;
  label: string;
  min: number;
  max: number;
}[] = [
  { key: "brightness", label: "밝기", min: -100, max: 100 },
  { key: "contrast", label: "대비", min: -100, max: 100 },
  { key: "saturation", label: "채도", min: -100, max: 100 },
  { key: "warmth", label: "색온도", min: -100, max: 100 },
  { key: "tint", label: "틴트", min: -100, max: 100 },
  { key: "gamma", label: "감마", min: -100, max: 100 },
];

interface AdjustmentSubmenuProps {
  isExiting?: boolean;
  onPreview?: (values: AdjustmentValues) => void;
  onApply?: (values: AdjustmentValues) => void;
  onReset?: () => void;
}

export default function AdjustmentSubmenu({
  isExiting,
  onPreview,
  onApply,
  onReset,
}: AdjustmentSubmenuProps) {
  const [selectedKey, setSelectedKey] = useState<keyof AdjustmentValues | null>(
    null,
  );
  const [values, setValues] = useState<AdjustmentValues>({
    ...DEFAULT_ADJUSTMENTS,
  });

  const selectedAdjustment = ADJUSTMENTS.find((a) => a.key === selectedKey);

  const handleChange = useCallback(
    (key: keyof AdjustmentValues, value: number) => {
      setValues((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  useEffect(() => {
    const isDefault = Object.values(values).every((v) => v === 0);
    if (!isDefault) {
      onPreview?.(values);
    }
  }, [values, onPreview]);

  const handleOptionClick = (key: keyof AdjustmentValues) => {
    if (selectedKey === key) {
      setSelectedKey(null);
    } else {
      setSelectedKey(key);
    }
  };

  const handleApply = () => {
    const isDefault = Object.values(values).every((v) => v === 0);
    if (!isDefault) {
      onApply?.(values);
      setValues({ ...DEFAULT_ADJUSTMENTS });
      setSelectedKey(null);
    }
  };

  const handleInputChange = (
    key: keyof AdjustmentValues,
    inputValue: string,
  ) => {
    const num = Number.parseInt(inputValue, 10);
    if (!Number.isNaN(num) && selectedAdjustment) {
      const clamped = Math.max(
        selectedAdjustment.min,
        Math.min(selectedAdjustment.max, num),
      );
      handleChange(key, clamped);
    }
  };

  return (
    <SubmenuContainer isExiting={isExiting}>
      <div {...stylex.props(styles.optionGroup)}>
        {ADJUSTMENTS.map(({ key, label }) => (
          <IconButton
            key={key}
            isActive={selectedKey === key}
            onClick={() => handleOptionClick(key)}
          >
            {label}
            {values[key] !== 0 && ` (${values[key]})`}
          </IconButton>
        ))}
      </div>

      {selectedKey && selectedAdjustment && (
        <div {...stylex.props(styles.controlsGroup)}>
          <div {...stylex.props(styles.sliderContainer)}>
            <span {...stylex.props(styles.sliderLabel)}>
              {selectedAdjustment.label}
            </span>
            <Range
              min={selectedAdjustment.min}
              max={selectedAdjustment.max}
              value={values[selectedKey]}
              onChange={(v) => handleChange(selectedKey, v)}
              aria-label={selectedAdjustment.label}
            />
            <input
              type="number"
              {...stylex.props(styles.valueInput)}
              value={values[selectedKey]}
              min={selectedAdjustment.min}
              max={selectedAdjustment.max}
              onChange={(e) => handleInputChange(selectedKey, e.target.value)}
            />
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
