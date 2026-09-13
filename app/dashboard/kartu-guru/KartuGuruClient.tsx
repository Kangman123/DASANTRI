"use client";

type GuruCard = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  institutionName: string;
  institutionLogo: string | null;
};

export function KartuGuruClient({ gurus }: { gurus: GuruCard[] }) {
  return (
    <div>
      <div className="print:hidden mb-4">
        <button onClick={() => window.print()}>Cetak / Download PDF</button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {gurus.map((g) => (
          <div
            key={g.id}
            className="border border-slate-300 rounded-lg overflow-hidden flex bg-white print:break-inside-avoid"
            style={{ width: "85.6mm", height: "54mm" }}
          >
            <div className="flex-1 p-3 flex flex-col">
              <div className="flex items-center gap-1.5 mb-1">
                {g.institutionLogo && <img src={g.institutionLogo} alt="" className="w-5 h-5 rounded object-cover" />}
                <p className="text-[8px] font-semibold leading-tight">{g.institutionName}</p>
              </div>
              <p className="text-[7px] text-slate-500 mb-2">Guru/Ustadz</p>
              <div className="mt-auto">
                <p className="text-[10px] font-bold leading-tight">{g.name}</p>
                <p className="text-[8px] text-slate-600">{g.email}</p>
              </div>
            </div>
            <div className="w-16 flex-shrink-0 bg-slate-100 flex items-center justify-center">
              {g.image ? (
                <img src={g.image} alt={g.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[8px] text-slate-400">Foto</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {gurus.length === 0 && <p className="text-sm text-slate-400">Belum ada guru/ustadz.</p>}
    </div>
  );
}