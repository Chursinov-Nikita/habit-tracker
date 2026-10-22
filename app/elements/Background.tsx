export default function Background() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#0B0F1A]"
    >
      <div className="absolute -left-24 -top-32 h-96 w-96 rounded-full bg-[#8B5CF6]/30 blur-[130px]" />
      <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-[#6366F1]/20 blur-[130px]" />
      <div className="absolute -bottom-40 left-1/3 h-96 w-120 rounded-full bg-[#A855F7]/20 blur-[140px]" />
      <div className="absolute bottom-10 left-[6%] h-48 w-48 rounded-full bg-[#8B5CF6]/15 blur-[100px]" />
    </div>
  );
}
