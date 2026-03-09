import * as stylex from "@stylexjs/stylex";
import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import {
  Crosshair,
  Edit2,
  Edit3,
  Layers,
  RefreshCcw,
  RotateCcw,
  RotateCw,
  Save,
} from "react-feather";

import { useClickOutside } from "../../../hooks/useClickOutside";
import {
  activeToolAtom,
  drawingSettingsAtom,
  type ToolType,
} from "../../../store/imageAtoms";
import { colors, fontSize, spacing } from "../../../tokens.stylex";
import Confirm from "../../shared/Confirm";
import IconButton from "../../shared/IconButton";
import DrawSubmenu from "./DrawSubmenu";
import EditSubmenu from "./EditSubmenu";
import FilterSubmenu from "./FilterSubmenu";

const styles = stylex.create({
  container: {
    position: "fixed",
    width: "100%",
    bottom: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    zIndex: 1000,
  },
  toolbar: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: spacing.small,
    padding: `${spacing.small} ${spacing.medium}`,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(12px)",
    borderTop: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
    overflowX: "scroll",
  },
  activeButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    color: colors.accent,
  },
  label: {
    fontSize: fontSize.xsmall,
    width: 28,
    fontWeight: 500,
    opacity: 0.9,
    textAlign: "center",
  },
  divider: {
    width: "1px",
    height: "32px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    margin: `0 ${spacing.small}`,
    flexShrink: 0,
  },
});

interface ImageToolbarProps {
  onUndo?: () => void;
  onRedo?: () => void;
  onSaveClick?: () => void;
  onClearAll?: () => void;
  onReset?: () => void;
}

const ICON_SIZE = 18;

export default function ImageToolbar({
  onUndo,
  onRedo,
  onSaveClick,
  onClearAll,
  onReset,
}: ImageToolbarProps) {
  const [activeTool, setActiveTool] = useAtom(activeToolAtom);
  const [drawingSettings, setDrawingSettings] = useAtom(drawingSettingsAtom);
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayedTool, setDisplayedTool] = useState<ToolType>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  useClickOutside(containerRef, () => setIsSubmenuOpen(false), isSubmenuOpen);

  useEffect(() => {
    if (activeTool) {
      setIsSubmenuOpen(true);
    } else {
      setIsSubmenuOpen(false);
    }
  }, [activeTool]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (isSubmenuOpen && activeTool) {
      setDisplayedTool(activeTool);
      setIsExiting(false);
    } else if (displayedTool) {
      setIsExiting(true);
      timeout = setTimeout(() => {
        setDisplayedTool(null);
        setIsExiting(false);
      }, 300);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isSubmenuOpen, activeTool, displayedTool]);

  const handleToolClick = (tool: ToolType) => {
    if (activeTool === tool) {
      setIsSubmenuOpen(!isSubmenuOpen);
    } else {
      setActiveTool(tool);
    }
  };

  const updateDrawingSettings = (updates: Partial<typeof drawingSettings>) => {
    setDrawingSettings((prev) => ({ ...prev, ...updates }));
  };

  const renderSubmenu = () => {
    if (!displayedTool) return null;

    switch (displayedTool) {
      case "draw":
        return (
          <DrawSubmenu
            drawingSettings={drawingSettings}
            updateDrawingSettings={updateDrawingSettings}
            onClearAll={onClearAll}
            isExiting={isExiting}
          />
        );
      case "filter":
        return <FilterSubmenu isExiting={isExiting} />;
      case "edit":
        return <EditSubmenu isExiting={isExiting} />;
      default:
        return null;
    }
  };

  return (
    <div ref={containerRef} {...stylex.props(styles.container)}>
      {renderSubmenu()}
      <div {...stylex.props(styles.toolbar)}>
        <IconButton onClick={onUndo} aria-label="Undo">
          <RotateCcw size={ICON_SIZE} />
          <span {...stylex.props(styles.label)}>뒤로</span>
        </IconButton>
        <IconButton onClick={onRedo} aria-label="Redo">
          <RotateCw size={ICON_SIZE} />
          <span {...stylex.props(styles.label)}>앞으로</span>
        </IconButton>

        <div {...stylex.props(styles.divider)} />

        <IconButton
          isActive={activeTool === "select"}
          onClick={() => handleToolClick("select")}
          aria-label="Select"
        >
          <Crosshair size={ICON_SIZE} />
          <span {...stylex.props(styles.label)}>선택</span>
        </IconButton>

        <div {...stylex.props(styles.divider)} />

        <IconButton
          isActive={activeTool === "draw"}
          onClick={() => handleToolClick("draw")}
          aria-label="Draw"
        >
          <Edit2 size={ICON_SIZE} />
          <span {...stylex.props(styles.label)}>그리기</span>
        </IconButton>
        <IconButton
          isActive={activeTool === "filter"}
          onClick={() => handleToolClick("filter")}
          aria-label="Add Filter"
        >
          <Layers size={ICON_SIZE} />
          <span {...stylex.props(styles.label)}>필터</span>
        </IconButton>
        <IconButton
          isActive={activeTool === "edit"}
          onClick={() => handleToolClick("edit")}
          aria-label="Edit"
        >
          <Edit3 size={ICON_SIZE} />
          <span {...stylex.props(styles.label)}>편집</span>
        </IconButton>

        <div {...stylex.props(styles.divider)} />

        <IconButton
          onClick={() => setIsResetModalOpen(true)}
          aria-label="Reset all"
        >
          <RefreshCcw size={ICON_SIZE} />
          <span {...stylex.props(styles.label)}>초기화</span>
        </IconButton>
        <IconButton onClick={onSaveClick} aria-label="Save">
          <Save size={ICON_SIZE} />
          <span {...stylex.props(styles.label)}>저장</span>
        </IconButton>
      </div>

      <Confirm
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={() => {
          onReset?.();
          setIsResetModalOpen(false);
        }}
        title="초기화 하시겠습니까?"
        message="작업 중인 모든 내용이 사라집니다."
        confirmText="초기화"
        variant="danger"
      />
    </div>
  );
}
