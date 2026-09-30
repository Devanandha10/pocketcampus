import type { Destination } from "@/data/campus";

type Props = {
  destinations: Destination[];
  start: string;
  end: string;
  onStart: (v: string) => void;
  onEnd: (v: string) => void;
  onFind: () => void;
  onClear: () => void;
  steps: string[];
  minutes: number | null;
  error: string | null;
};

export default function NavPanel({
  destinations,
  start,
  end,
  onStart,
  onEnd,
  onFind,
  onClear,
  steps,
  minutes,
  error,
}: Props) {
  const options = destinations.map((d) => (
    <option key={d.value} value={d.value}>
      {d.label}
    </option>
  ));

  return (
    <div className="panel p-4">
      <p className="text-[11px] uppercase tracking-[0.2em] text-accent">Plan your walk</p>
      <h2 className="mt-1 font-display text-lg font-bold text-foreground">Campus Navigator</h2>

      <label className="field-label" htmlFor="start">
        Start location
      </label>
      <select id="start" value={start} onChange={(e) => onStart(e.target.value)} className="field">
        <option value="">Select a starting point</option>
        {options}
      </select>

      <label className="field-label" htmlFor="end">
        End location
      </label>
      <select id="end" value={end} onChange={(e) => onEnd(e.target.value)} className="field">
        <option value="">Select a destination</option>
        {options}
      </select>

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
        <button onClick={onFind} className="btn-primary">
          Find Route
        </button>
        <button onClick={onClear} className="btn-ghost px-4">
          Clear
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      {steps.length > 0 && (
        <div className="mt-4 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Directions</span>
            {minutes !== null && <span className="badge">{minutes} min walk</span>}
          </div>
          <ol className="mt-3 space-y-3">
            {steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="step-num">{i + 1}</span>
                <span className="text-sm leading-relaxed text-muted-foreground">{s}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
