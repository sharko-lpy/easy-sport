import WeeklyActivityChart from "./WeeklyActivityChart";

type LogRow = {
  id: string;
  performed_at: string;
  sets_completed: number | null;
  reps_completed: number | null;
  weight_kg: number | null;
  exerciseName: string;
};

export default function ActivityHistoryView({ logs }: { logs: LogRow[] }) {
  return (
    <div className="space-y-6">
      <WeeklyActivityChart logs={logs} />

      <div className="glass-card p-4">
        <p className="mb-3 text-sm font-medium text-white/70">
          Dernières séances
        </p>
        {logs.length === 0 ? (
          <p className="text-sm text-white/50">
            Aucune séance enregistrée pour l'instant.
          </p>
        ) : (
          <ul className="space-y-2">
            {logs.slice(0, 15).map((log) => (
              <li
                key={log.id}
                className="flex items-center justify-between border-t border-white/10 pt-2 first:border-t-0 first:pt-0"
              >
                <div>
                  <p className="text-sm text-white/90">{log.exerciseName}</p>
                  <p className="text-xs text-white/50">
                    {new Date(log.performed_at).toLocaleDateString("fr-FR", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <p className="text-xs text-white/60">
                  {log.sets_completed ?? "-"} x {log.reps_completed ?? "-"}
                  {log.weight_kg ? ` @ ${log.weight_kg}kg` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
