import * as stylex from "@stylexjs/stylex";
import { useAtom, useAtomValue } from "jotai";
import { AlertTriangle } from "react-feather";

import {
  cacheTTLAtom,
  DEFAULT_CACHE_TTL,
  DEFAULT_HISTORY_LIMIT,
  historyAtom,
  historyLimitAtom,
} from "../../store/imageAtoms";
import { colors, radius, spacing } from "../../tokens.stylex";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import Range from "../ui/Range";

const styles = stylex.create({
  section: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.large,
  },
  item: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.small,
  },
  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: colors.textMain,
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: spacing.medium,
  },
  value: {
    fontSize: "13px",
    fontWeight: 600,
    color: colors.accent,
    minWidth: "40px",
    textAlign: "right" as const,
  },
  description: {
    fontSize: "11px",
    color: colors.textMuted,
    marginTop: "-2px",
  },
  alert: {
    display: "flex",
    alignItems: "center",
    gap: spacing.small,
    padding: `${spacing.small} ${spacing.medium}`,
    backgroundColor: "rgba(234, 179, 8, 0.1)",
    borderRadius: radius.md,
    fontSize: "11px",
    color: "#eab308",
    marginTop: "-2px",
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    paddingTop: spacing.medium,
    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
    marginTop: spacing.small,
  },
});

const CACHE_TTL_OPTIONS = [
  { value: 0, label: "사용 안 함" },
  { value: 1, label: "1일" },
  { value: 3, label: "3일" },
  { value: 7, label: "7일" },
  { value: 30, label: "30일" },
];

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [historyLimit, setHistoryLimit] = useAtom(historyLimitAtom);
  const [cacheTTL, setCacheTTL] = useAtom(cacheTTLAtom);
  const history = useAtomValue(historyAtom);

  const currentSnapshotCount = history.snapshots.length;
  const willTruncate = currentSnapshotCount > historyLimit;

  const cacheTTLIndex = CACHE_TTL_OPTIONS.findIndex(
    (o) => o.value === cacheTTL,
  );
  const currentCacheTTLIndex = cacheTTLIndex >= 0 ? cacheTTLIndex : 1;

  const handleReset = () => {
    setHistoryLimit(DEFAULT_HISTORY_LIMIT);
    setCacheTTL(DEFAULT_CACHE_TTL);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="설정">
      <div {...stylex.props(styles.section)}>
        <div {...stylex.props(styles.item)}>
          <span {...stylex.props(styles.label)}>최대 히스토리 갯수</span>
          <div {...stylex.props(styles.row)}>
            <Range
              min={1}
              max={50}
              value={historyLimit}
              onChange={setHistoryLimit}
              aria-label="최대 히스토리 갯수"
            />
            <span {...stylex.props(styles.value)}>{historyLimit}</span>
          </div>
          <span {...stylex.props(styles.description)}>
            실행 취소/다시 실행에 저장되는 최대 단계 수입니다.
          </span>
          {willTruncate && (
            <div {...stylex.props(styles.alert)}>
              <AlertTriangle size={14} />
              <span>
                현재 {currentSnapshotCount}개의 히스토리가 저장되어 있습니다.
                적용 시 앞에서부터 {currentSnapshotCount - historyLimit}개가
                삭제됩니다.
              </span>
            </div>
          )}
        </div>

        <div {...stylex.props(styles.item)}>
          <span {...stylex.props(styles.label)}>자동 캐시 삭제</span>
          <div {...stylex.props(styles.row)}>
            <Range
              min={0}
              max={CACHE_TTL_OPTIONS.length - 1}
              value={currentCacheTTLIndex}
              onChange={(index) => setCacheTTL(CACHE_TTL_OPTIONS[index].value)}
              aria-label="자동 캐시 삭제 기간"
            />
            <span {...stylex.props(styles.value)}>
              {CACHE_TTL_OPTIONS[currentCacheTTLIndex].label}
            </span>
          </div>
          <span {...stylex.props(styles.description)}>
            설정된 기간이 지난 세션 캐시를 자동으로 삭제합니다.
          </span>
        </div>

        <div {...stylex.props(styles.footer)}>
          <Button type="button" onClick={handleReset}>
            기본값으로 초기화
          </Button>
        </div>
      </div>
    </Modal>
  );
}
