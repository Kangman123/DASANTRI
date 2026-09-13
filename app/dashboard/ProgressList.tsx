export function ProgressList({ items }: { items: { name: string; sub: string; percent: number; initials: string }[] }) {
  return (
    <div className="flex flex-col gap-4">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-medium flex-shrink-0">
            {item.initials}
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <div>
                <p className="font-medium text-slate-700">{item.name}</p>
                <p className="text-xs text-slate-400">{item.sub}</p>
              </div>
              <span className="font-medium text-slate-600">{item.percent}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-sky-400 rounded-full" style={{ width: `${item.percent}%` }} />
            </div>
          </div>
        </div>
      ))}
      {items.length === 0 && <p className="text-sm text-slate-400">Belum ada data.</p>}
    </div>
  );
}