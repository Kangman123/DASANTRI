export function WelcomeBanner({ name, institutionName }: { name: string; institutionName: string }) {
  return (
    <div
      className="rounded-2xl p-6 mb-6 relative overflow-hidden text-white"
      style={{ background: "linear-gradient(135deg, #6d28d9 0%, #9333ea 50%, #c026d3 100%)" }}
    >
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle at 20% 20%, white 2px, transparent 2px), radial-gradient(circle at 80% 60%, white 1.5px, transparent 1.5px)",
          backgroundSize: "40px 40px, 28px 28px",
        }}
      />
      <div className="relative z-10">
        <p className="text-sm text-violet-100">Assalamu'alaikum warahmatullah,</p>
        <p className="text-2xl font-semibold mt-1">{name}</p>
        <p className="text-sm text-violet-100 mt-1">{institutionName}</p>
      </div>
    </div>
  );
}