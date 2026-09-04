interface DonutSegment {
  value: number;
  color: string;
  label: string;
}

export function DonutChart({ segments }: { segments: DonutSegment[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) {
    return (
      <div className="w-28 h-28 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-400">
        Sem dados
      </div>
    );
  }

  const r = 50,
    cx = 60,
    cy = 60,
    stroke = 22;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth={stroke} />
      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const dash = circumference * pct;
        const gap = circumference - dash;
        const rotation = -90 + (offset / total) * 360;
        offset += seg.value;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={0}
            transform={`rotate(${rotation} ${cx} ${cy})`}
            strokeLinecap="butt"
          />
        );
      })}
    </svg>
  );
}
