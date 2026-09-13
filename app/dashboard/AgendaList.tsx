const WARNA = ["bg-sky-500", "bg-emerald-500", "bg-amber-500", "bg-red-500"];

export function AgendaList({ items }: { items: { tanggal: string; bulan: string; judul: string }[] }) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => (
        <div key={i} className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm overflow-hidden relative">
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${WARNA[i % WARNA.length]}`} />
          <div className="text-center flex-shrink-0 pl-1">
            <p className="text-lg font-bold text-slate-800 leading-none">{item.tanggal}</p>
            <p className="text-[10px] text-slate-400 uppercase">{item.bulan}</p>
          </div>
          <p className="text-sm text-slate-600 leading-tight">{item.judul}</p>
        </div>
      ))}
      {items.length === 0 && <p className="text-sm text-slate-400">Belum ada pengumuman.</p>}
    </div>
  );
}