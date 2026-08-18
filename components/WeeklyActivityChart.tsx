const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function getCurrentWeekDays(): Date[] {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

// Graphique en barres, dessiné à la main (pas de dépendance externe),
// comptant le nombre de séances enregistrées par jour de la semaine en cours.
export default function WeeklyActivityChart({
  logs,
}: {
  logs: { performed_at: string }[];
}) {
  const weekDays = getCurrentWeekDays();
  const counts = weekDays.map(
    (day) =>
      logs.filter(
        (l) => new Date(l.performed_at).toDateString() === day.toDateString()
      ).length
  );
  const max = Math.max(1, ...counts);
  const total = counts.reduce((a, b) => a + b, 0);

  return (
    <div className="glass-card p-4">
      <div className="mb-4 flex items-baseline justify-between">
        <p className="text-sm font-medium text-white/70">
          Activité de la semaine
        </p>
        <p className="text-sm text-white/50">
          {total} séance{total !== 1 ? "s" : ""} enregistrée
          {total !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex h-32 items-end justify-between gap-2">
        {counts.map((count, i) => (
          <div
            key={i}
            className="flex h-full flex-1 flex-col items-center justify-end gap-1"
          >
            <span className="text-[10px] text-white/50">
              {count > 0 ? count : ""}
            </span>
            <div
              className="min-h-[4px] w-full rounded-t-md bg-gradient-to-t from-pink-600 to-pink-300"
              style={{ height: `${Math.max(4, (count / max) * 100)}%` }}
            />
          </div>
        ))}
      </div>

      <div className="mt-1 flex justify-between gap-2">
        {DAY_LABELS.map((label) => (
          <span
            key={label}
            className="flex-1 text-center text-xs text-white/60"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
