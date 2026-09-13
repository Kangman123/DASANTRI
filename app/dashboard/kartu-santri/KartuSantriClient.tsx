"use client";
import { useRef, useState } from "react";

type SantriCard = {
  id: string; name: string; nis: string; fotoUrl: string | null;
  jenisKelamin: string | null; tempatLahir: string | null; dob: string | null; address: string | null;
};
type LembagaInfo = {
  name: string; namaArab: string | null; logoUrl: string | null;
  kewajibanKartu: string | null; namaKepalaSekolah: string | null;
  alamatLengkap: string;
};

export function KartuSantriClient({ santris, lembaga }: { santris: SantriCard[]; lembaga: LembagaInfo }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const kewajibanList = lembaga.kewajibanKartu ? lembaga.kewajibanKartu.split("\n").filter(Boolean) : [];

  async function handleDownloadPDF() {
    setIsDownloading(true);
    const html2canvas = (await import("html2canvas-pro")).default;
    const { jsPDF } = await import("jspdf");

    const rows = containerRef.current?.querySelectorAll<HTMLDivElement>(".kartu-row");
    if (!rows || rows.length === 0) {
      setIsDownloading(false);
      return;
    }

    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: [190, 60] });

    for (let i = 0; i < rows.length; i++) {
      const canvas = await html2canvas(rows[i], { scale: 3, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      if (i > 0) pdf.addPage([190, 60], "landscape");
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    }

    pdf.save("kartu-tanda-santri.pdf");
    setIsDownloading(false);
  }

  return (
    <div>
      <div className="print:hidden mb-4 flex gap-2">
        <button onClick={() => window.print()}>Cetak (via Printer)</button>
        <button onClick={handleDownloadPDF} disabled={isDownloading}>
          {isDownloading ? "Membuat PDF..." : "Download PDF"}
        </button>
      </div>

      <div ref={containerRef} className="flex flex-col gap-6">
        {santris.map((s) => (
          <div key={s.id} className="kartu-row flex gap-6 print:break-inside-avoid">
            {/* SISI DEPAN */}
            <div className="border border-slate-300 rounded-lg overflow-hidden relative" style={{ width: "85.6mm", height: "54mm" }}>
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #15803d 0%, #15803d 22%, white 22%, white 82%, #15803d 82%)" }} />
              <div className="relative h-full flex flex-col p-2">
                <p dir="rtl" className="text-white text-center font-serif text-[9px] leading-tight mt-0.5">{lembaga.namaArab}</p>
                <div className="flex flex-1 gap-2 mt-1">
                  <div className="w-14 flex-shrink-0 flex flex-col items-center">
                    {lembaga.logoUrl && <img src={lembaga.logoUrl} alt="" className="w-12 h-12 object-contain" />}
                    <p className="text-[6.5px] font-bold text-center leading-tight mt-1">{lembaga.name}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-[7px] font-bold underline">KEWAJIBAN</p>
                    <ol className="text-[6px] leading-tight list-decimal ml-3">
                      {kewajibanList.map((k, i) => (
                        <li key={i}>{k}</li>
                      ))}
                    </ol>
                  </div>
                </div>
                <div className="flex justify-end items-end mt-auto">
                  <p className="text-[6px] text-right leading-tight">
                    <span className="font-bold">{lembaga.namaKepalaSekolah ?? "-"}</span><br />Pengasuh
                  </p>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-emerald-700 text-white text-[5.5px] text-center py-0.5">
                Bila menemukan kartu ini harap segera dikembalikan ke {lembaga.name}
              </div>
            </div>

            {/* SISI BELAKANG */}
            <div className="border border-slate-300 rounded-lg overflow-hidden relative" style={{ width: "85.6mm", height: "54mm" }}>
              <div className="h-8 flex items-center gap-2 px-2" style={{ background: "linear-gradient(90deg, #15803d, #16a34a)" }}>
                {lembaga.logoUrl && <img src={lembaga.logoUrl} alt="" className="w-6 h-6 rounded-full object-cover" />}
                <div className="text-white leading-tight">
                  <p className="text-[6px]">{lembaga.name}</p>
                  <p className="text-[7px] font-bold">KARTU TANDA SANTRI (KTS)</p>
                </div>
              </div>
              <div className="flex p-2 gap-2">
                <div className="w-14 h-16 flex-shrink-0 bg-slate-100 flex items-center justify-center">
                  {s.fotoUrl ? <img src={s.fotoUrl} alt={s.name} className="w-full h-full object-cover" /> : <span className="text-[6px] text-slate-400">Foto</span>}
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-bold leading-tight">{s.name}</p>
                  <table className="text-[6px] mt-1">
                    <tbody>
                      <tr><td className="pr-1 align-top">NIS</td><td className="align-top">: {s.nis}</td></tr>
                      <tr><td className="pr-1 align-top">Jenis Kelamin</td><td className="align-top">: {s.jenisKelamin ?? "-"}</td></tr>
                      <tr><td className="pr-1 align-top">Tetala</td><td className="align-top">: {s.tempatLahir ?? "-"}{s.dob ? `, ${s.dob}` : ""}</td></tr>
                      <tr><td className="pr-1 align-top">Alamat</td><td className="align-top">: {s.address ?? "-"}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-emerald-700 text-white text-[6px] text-center py-0.5">
                Berlaku selama menjadi santri
              </div>
            </div>
          </div>
        ))}
      </div>

      {santris.length === 0 && <p className="text-sm text-slate-400">Belum ada santri di unit ini.</p>}
    </div>
  );
}