type ProbabilitySplitProps = {
  yesValue: number;
  noValue: number;
  yesLabel?: string;
  noLabel?: string;
  formatValue?: (value: number) => string;
  compact?: boolean;
};

function clampNumber(value: number) {
  if (!Number.isFinite(value) || value < 0) return 0;

  return value;
}

export function ProbabilitySplit({
  yesValue,
  noValue,
  yesLabel = 'YES',
  noLabel = 'NO',
  formatValue = (value) => `${Math.round(value * 100)}%`,
  compact = false
}: ProbabilitySplitProps) {
  const normalizedYes = clampNumber(yesValue);
  const normalizedNo = clampNumber(noValue);
  const total = normalizedYes + normalizedNo;
  const yesWidth = total > 0 ? (normalizedYes / total) * 100 : 50;
  const noWidth = total > 0 ? (normalizedNo / total) * 100 : 50;

  return (
    <div className="stackXs">
      <div className={compact ? 'splitBar splitBarCompact' : 'splitBar'} aria-hidden="true">
        <div className="splitBarYes" style={{ width: `${yesWidth}%` }} />
        <div className="splitBarNo" style={{ width: `${noWidth}%` }} />
      </div>
      <div className="splitLegend">
        <span>
          {yesLabel} {formatValue(normalizedYes)}
        </span>
        <span>
          {noLabel} {formatValue(normalizedNo)}
        </span>
      </div>
    </div>
  );
}
