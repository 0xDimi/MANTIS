import { formatPercent } from '@/lib/format';
import { clampProbability } from '@/lib/probability-visuals';
import { tr, type UiLang } from '@/lib/ui-lang';

type ProbabilityRailProps = {
  yesProbability: number;
  previousProbability?: number | null;
  volume?: number | null;
  status?: string | null;
  showTicks?: boolean;
  showMarker?: boolean;
  size?: 'sm' | 'md' | 'lg';
  locale: UiLang;
  label?: string;
  className?: string;
};

const railTicks = [0, 25, 50, 75, 100];

function railStatusClass(status: string | null | undefined) {
  if (status === 'resolved' || status === 'settled') return 'probabilityRailResolved';
  if (status === 'closed' || status === 'suspended') return 'probabilityRailInactive';
  return '';
}

export function ProbabilityRail({
  yesProbability,
  previousProbability,
  volume,
  status,
  showTicks = true,
  showMarker = true,
  size = 'md',
  locale,
  label,
  className
}: ProbabilityRailProps) {
  const currentProbability = clampProbability(yesProbability);
  const previous = previousProbability == null ? null : clampProbability(previousProbability);
  const currentPercent = currentProbability * 100;
  const previousPercent = previous == null ? null : previous * 100;
  const quiet = (volume ?? 0) <= 0;
  const classes = [
    'probabilityRail',
    `probabilityRail${size.toUpperCase()}`,
    quiet ? 'probabilityRailQuiet' : '',
    railStatusClass(status),
    className ?? ''
  ]
    .join(' ')
    .trim();

  const railLabel = label ?? tr(locale, 'YES probability', 'Πιθανότητα ΝΑΙ');

  return (
    <div className={classes} role="img" aria-label={`${railLabel} ${formatPercent(currentProbability)}`}>
      <div className="probabilityRailTrack" aria-hidden="true">
        {showTicks
          ? railTicks.map((tick) => (
              <span key={tick} className="probabilityRailTick" style={{ left: `${tick}%` }} />
            ))
          : null}

        {previousPercent != null ? <span className="probabilityRailPrevious" style={{ left: `${previousPercent}%` }} /> : null}

        {showMarker ? (
          <span className="probabilityRailMarker" style={{ left: `${currentPercent}%` }}>
            <span className="probabilityRailMarkerCore" />
          </span>
        ) : null}
      </div>
    </div>
  );
}
