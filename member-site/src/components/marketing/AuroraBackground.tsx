export function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#07040f]">
      <div className="absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-fuchsia-600/25 blur-[120px]" />
      <div className="absolute -right-40 top-20 h-[28rem] w-[28rem] rounded-full bg-purple-600/25 blur-[120px]" />
      <div className="absolute bottom-[-10rem] left-1/3 h-[26rem] w-[26rem] rounded-full bg-indigo-500/15 blur-[120px]" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 20% 30%, white, transparent), radial-gradient(1px 1px at 70% 20%, white, transparent), radial-gradient(1px 1px at 40% 70%, white, transparent), radial-gradient(1px 1px at 85% 65%, white, transparent), radial-gradient(1.5px 1.5px at 60% 45%, white, transparent), radial-gradient(1px 1px at 10% 80%, white, transparent)",
          backgroundRepeat: "repeat",
          backgroundSize: "300px 300px",
        }}
      />
    </div>
  );
}
