export function AuroraBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 bg-[#f6f2fb]"
      style={{
        backgroundImage: "url(/celestial-bg.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    />
  );
}
