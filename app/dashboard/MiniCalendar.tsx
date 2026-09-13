export function MiniCalendar({ highlightDates }: { highlightDates: number[] }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();

  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const bulanNama = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  return (
    <div>
      <p className="text-sm font-medium text-slate-700 mb-3">{bulanNama[month]} {year}</p>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((d) => (
          <div key={d} className="text-slate-400 py-1 font-medium">{d}</div>
        ))}
        {cells.map((d, i) => (
          <div
            key={i}
            className={`py-1.5 rounded-full ${
              d === today
                ? "bg-violet-600 text-white font-medium"
                : d && highlightDates.includes(d)
                ? "bg-emerald-100 text-emerald-700"
                : "text-slate-600"
            }`}
          >
            {d ?? ""}
          </div>
        ))}
      </div>
    </div>
  );
}