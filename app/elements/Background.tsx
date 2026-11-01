export default function Background() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink"
    >
      <div className="absolute -left-24 -top-32 h-96 w-96 rounded-full bg-accent/30 blur-[130px]" />
      <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-primary/20 blur-[130px]" />
      <div className="absolute -bottom-40 left-1/3 h-96 w-120 rounded-full bg-[#A855F7]/20 blur-[140px]" />
      <div className="absolute bottom-10 left-[6%] h-48 w-48 rounded-full bg-accent/15 blur-[100px]" />
    </div>
  );
}
